import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTemplate } from "@/components/templates/registry";
import { createUniqueGiftSlug, toGiftData } from "@/lib/gift-record";
import { getShareUrl } from "@/lib/utils";
import { createGiftRequestSchema } from "@/lib/validation";
import { ASSET_STATUSES } from "@/lib/asset-record";
import type { GiftResponse } from "@/types/gift";
import type { Asset, Prisma } from "@prisma/client";

type CreateGiftImageInput = {
  assetId: string;
  publicUrl: string;
  objectPath: string;
  label?: string | null;
  position?: Prisma.InputJsonValue;
};

function buildImageCreateData(
  requestedImages: Array<{
    assetId: string;
    label?: string;
    position?: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
    };
  }>,
  assetMap: Map<string, Asset>,
): CreateGiftImageInput[] {
  return requestedImages.map((image) => {
    const asset = assetMap.get(image.assetId);
    if (!asset) {
      throw new Error(`Asset ${image.assetId} không tồn tại.`);
    }
    return {
      assetId: asset.id,
      publicUrl: asset.publicUrl,
      objectPath: asset.objectPath,
      label: image.label ?? null,
      position: (image.position as Prisma.InputJsonValue) ?? undefined,
    };
  });
}

function validateAttachableAssets(assets: Asset[]): Map<string, Asset> {
  const now = Date.now();
  const assetMap = new Map<string, Asset>();

  for (const asset of assets) {
    if (asset.status !== ASSET_STATUSES.uploaded) {
      throw new Error(`Asset ${asset.id} không ở trạng thái UPLOADED.`);
    }
    if (asset.giftId) {
      throw new Error(`Asset ${asset.id} đã được gắn vào gift khác.`);
    }
    if (asset.expiresAt && asset.expiresAt.getTime() <= now) {
      throw new Error(`Asset ${asset.id} đã hết hạn, vui lòng upload lại.`);
    }
    assetMap.set(asset.id, asset);
  }

  return assetMap;
}

export async function POST(request: NextRequest) {
  try {
    const parsed = createGiftRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const template = getTemplate(payload.templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template không tồn tại." },
        { status: 400 },
      );
    }

    const slug = await createUniqueGiftSlug({
      templateId: payload.templateId,
      senderName: payload.senderName,
      recipientName: payload.recipientName,
    });

    const requestedImages = payload.images ?? [];
    const requestedAssetIds = Array.from(
      new Set(requestedImages.map((image) => image.assetId)),
    );
    if (requestedAssetIds.length !== requestedImages.length) {
      return NextResponse.json(
        { error: "Mỗi ảnh chỉ được sử dụng 1 lần trong gift." },
        { status: 400 },
      );
    }
    const assets = requestedAssetIds.length
      ? await prisma.asset.findMany({
          where: {
            id: { in: requestedAssetIds },
          },
        })
      : [];
    const assetMap = validateAttachableAssets(assets);

    if (requestedAssetIds.length !== assetMap.size) {
      const missing = requestedAssetIds.filter((assetId) => !assetMap.has(assetId));
      return NextResponse.json(
        { error: `Không tìm thấy asset: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const imagesToCreate = buildImageCreateData(requestedImages, assetMap);

    const gift = await prisma.$transaction(async (tx) => {
      const created = await tx.gift.create({
        data: {
          slug,
          templateId: payload.templateId,
          config: payload.config as Prisma.InputJsonValue,
          message: payload.message,
          senderName: payload.senderName ?? null,
          recipientName: payload.recipientName ?? null,
          images: imagesToCreate.length
            ? {
                create: imagesToCreate,
              }
            : undefined,
        },
        include: { images: true },
      });

      if (requestedAssetIds.length) {
        await tx.asset.updateMany({
          where: {
            id: { in: requestedAssetIds },
          },
          data: {
            status: ASSET_STATUSES.attached,
            giftId: created.id,
            expiresAt: null,
          },
        });
      }

      return created;
    });

    const giftData = toGiftData(gift);
    const canonicalSlug = gift.slug || gift.id;
    const response: GiftResponse = {
      id: gift.id,
      slug: canonicalSlug,
      shareUrl: getShareUrl(canonicalSlug, { server: true }),
      gift: giftData,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/gifts error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tạo quà tặng";
    const clientError =
      message.includes("Asset") ||
      message.includes("Template") ||
      message.includes("hết hạn") ||
      message.includes("không tồn tại") ||
      message.includes("sử dụng 1 lần");
    const status = clientError ? 400 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}

export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { images: true },
    });

    return NextResponse.json(gifts.map(toGiftData));
  } catch (error) {
    console.error("GET /api/gifts error:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách quà tặng" },
      { status: 500 },
    );
  }
}

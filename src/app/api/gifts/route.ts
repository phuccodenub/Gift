import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTemplate } from "@/components/templates/registry";
import {
  assertGiftAssetAssignments,
  assertUniqueRequestedAssetIds,
  buildImageCreateData,
  buildStoredGiftConfig,
  getConfigAssetIds,
  validateAttachableAssets,
} from "@/lib/gift-assets";
import { createUniqueGiftSlug, toGiftData } from "@/lib/gift-record";
import { getShareUrl } from "@/lib/utils";
import { createGiftRequestSchema } from "@/lib/validation";
import { ASSET_STATUSES } from "@/lib/asset-record";
import type { GiftResponse } from "@/types/gift";
import type { Prisma } from "@prisma/client";

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
    const requestedAudioAssetIds = getConfigAssetIds(payload.config);
    const requestedAssetIds = [
      ...requestedImages.map((image) => image.assetId),
      ...requestedAudioAssetIds,
    ];
    assertUniqueRequestedAssetIds(requestedAssetIds);
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

    assertGiftAssetAssignments({
      assetMap,
      imageAssetIds: requestedImages.map((image) => image.assetId),
      audioAssetIds: requestedAudioAssetIds,
    });

    const imagesToCreate = buildImageCreateData(requestedImages, assetMap);
    const configForSave = buildStoredGiftConfig(payload.config, assetMap);

    const gift = await prisma.$transaction(async (tx) => {
      const created = await tx.gift.create({
        data: {
          slug,
          templateId: payload.templateId,
          config: configForSave as unknown as Prisma.InputJsonValue,
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
        const attachResult = await tx.asset.updateMany({
          where: {
            id: { in: requestedAssetIds },
            status: ASSET_STATUSES.uploaded,
            giftId: null,
          },
          data: {
            status: ASSET_STATUSES.attached,
            giftId: created.id,
            expiresAt: null,
          },
        });

        if (attachResult.count !== requestedAssetIds.length) {
          throw new Error(
            "Một hoặc nhiều asset vừa được sử dụng ở gift khác. Vui lòng upload lại.",
          );
        }
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
      message.includes("khả dụng") ||
      message.includes("hết hạn") ||
      message.includes("không tồn tại") ||
      message.includes("sử dụng 1 lần") ||
      message.includes("ảnh hợp lệ") ||
      message.includes("MP3 hợp lệ") ||
      message.includes("cùng 1 asset");
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

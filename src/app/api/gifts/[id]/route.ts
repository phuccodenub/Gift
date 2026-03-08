import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertGiftAssetAssignments,
  buildStoredGiftConfig,
  getConfigAssetIds,
  validateAttachableAssets,
} from "@/lib/gift-assets";
import { getShareUrl } from "@/lib/utils";
import { toGiftData } from "@/lib/gift-record";
import { updateGiftRequestSchema } from "@/lib/validation";
import { ASSET_STATUSES, scheduleAssetsForCleanup } from "@/lib/asset-record";
import type { GiftConfig, GiftResponse } from "@/types/gift";
import type { Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const gift = await prisma.gift.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!gift) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }

    const giftData = toGiftData(gift);
    const canonicalSlug = gift.slug || gift.id;

    const response: GiftResponse = {
      id: gift.id,
      slug: canonicalSlug,
      shareUrl: getShareUrl(canonicalSlug, { server: true }),
      gift: giftData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/gifts/[id] error:", error);
    return NextResponse.json(
      { error: "Không thể lấy quà tặng" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentGift = await prisma.gift.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!currentGift) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }

    const parsed = updateGiftRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const currentAudioAssetIds = getConfigAssetIds(currentGift.config as GiftConfig);
    const currentImageAssetIds = (currentGift.images ?? [])
      .map((image) => image.assetId)
      .filter((assetId): assetId is string => Boolean(assetId));
    let requestedAudioAssetIds = currentAudioAssetIds;
    let attachedAudioAssetIds: string[] = [];
    let removedAudioAssetIds: string[] = [];

    const updateData: Prisma.GiftUpdateInput = {};
    if (body.message !== undefined) updateData.message = body.message;
    if (body.senderName !== undefined) updateData.senderName = body.senderName || null;
    if (body.recipientName !== undefined) updateData.recipientName = body.recipientName || null;
    if (body.config !== undefined) {
      requestedAudioAssetIds = getConfigAssetIds(body.config);
      const assets = requestedAudioAssetIds.length
        ? await prisma.asset.findMany({
            where: {
              id: { in: requestedAudioAssetIds },
            },
          })
        : [];
      const assetMap = validateAttachableAssets(assets, id);
      if (requestedAudioAssetIds.length !== assetMap.size) {
        const missing = requestedAudioAssetIds.filter((assetId) => !assetMap.has(assetId));
        return NextResponse.json(
          { error: `Không tìm thấy asset: ${missing.join(", ")}` },
          { status: 400 },
        );
      }
      assertGiftAssetAssignments({
        assetMap,
        audioAssetIds: requestedAudioAssetIds,
        blockedAudioAssetIds: currentImageAssetIds,
      });
      updateData.config = buildStoredGiftConfig(body.config, assetMap) as unknown as Prisma.InputJsonValue;
      attachedAudioAssetIds = requestedAudioAssetIds.filter(
        (assetId) => !currentAudioAssetIds.includes(assetId),
      );
      removedAudioAssetIds = currentAudioAssetIds.filter(
        (assetId) => !requestedAudioAssetIds.includes(assetId),
      );
    }

    const gift = await prisma.$transaction(async (tx) => {
      const updated = await tx.gift.update({
        where: { id },
        data: updateData,
        include: { images: true },
      });

      if (attachedAudioAssetIds.length) {
        const attachResult = await tx.asset.updateMany({
          where: {
            id: { in: attachedAudioAssetIds },
            status: ASSET_STATUSES.uploaded,
            giftId: null,
          },
          data: {
            status: ASSET_STATUSES.attached,
            giftId: updated.id,
            expiresAt: null,
          },
        });

        if (attachResult.count !== attachedAudioAssetIds.length) {
          throw new Error(
            "Một hoặc nhiều asset vừa được sử dụng ở gift khác. Vui lòng upload lại.",
          );
        }
      }

      return updated;
    });

    if (removedAudioAssetIds.length) {
      await scheduleAssetsForCleanup(removedAudioAssetIds, 0).catch((error) => {
        console.error("Audio asset cleanup scheduling failed:", error);
      });
    }

    const giftData = toGiftData(gift);
    const canonicalSlug = gift.slug || gift.id;

    return NextResponse.json({
      id: gift.id,
      slug: canonicalSlug,
      shareUrl: getShareUrl(canonicalSlug, { server: true }),
      gift: giftData,
    });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }
    console.error("PATCH /api/gifts/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Không thể cập nhật quà tặng";
    const clientError =
      message.includes("Asset") ||
      message.includes("khả dụng") ||
      message.includes("hết hạn") ||
      message.includes("không tồn tại") ||
      message.includes("ảnh hợp lệ") ||
      message.includes("MP3 hợp lệ") ||
      message.includes("cùng 1 asset");
    return NextResponse.json(
      { error: message },
      { status: clientError ? 400 : 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const gift = await prisma.gift.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!gift) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }

    await prisma.gift.delete({ where: { id } });
    const assetIds = [
      ...(gift.images ?? [])
        .map((image) => image.assetId)
        .filter((assetId): assetId is string => Boolean(assetId)),
      ...getConfigAssetIds(gift.config as GiftConfig),
    ];
    await scheduleAssetsForCleanup(assetIds, 0).catch((error) => {
      console.error("Asset cleanup scheduling failed:", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }
    console.error("DELETE /api/gifts/[id] error:", error);
    return NextResponse.json(
      { error: "Không thể xóa quà tặng" },
      { status: 500 },
    );
  }
}

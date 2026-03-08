import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getShareUrl } from "@/lib/utils";
import { toGiftData } from "@/lib/gift-record";
import { updateGiftRequestSchema } from "@/lib/validation";
import { scheduleAssetsForCleanup } from "@/lib/asset-record";
import type { GiftResponse } from "@/types/gift";
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
    const parsed = updateGiftRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body = parsed.data;

    const updateData: Prisma.GiftUpdateInput = {};
    if (body.message !== undefined) updateData.message = body.message;
    if (body.senderName !== undefined) updateData.senderName = body.senderName || null;
    if (body.recipientName !== undefined) updateData.recipientName = body.recipientName || null;
    if (body.config !== undefined) updateData.config = body.config as Prisma.InputJsonValue;

    const gift = await prisma.gift.update({
      where: { id },
      data: updateData,
      include: { images: true },
    });
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
    return NextResponse.json(
      { error: "Không thể cập nhật quà tặng" },
      { status: 500 },
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
    const assetIds = (gift.images ?? [])
      .map((image) => image.assetId)
      .filter((assetId): assetId is string => Boolean(assetId));
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { viewBeaconSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const parsed = viewBeaconSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const gift = await prisma.gift.findUnique({ where: { id } });
    if (!gift) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }

    const { viewerId } = parsed.data;
    const tracked = await prisma.$transaction(async (tx) => {
      const existing = await tx.giftViewEvent.findUnique({
        where: {
          giftId_viewerId: {
            giftId: id,
            viewerId,
          },
        },
      });
      if (existing) {
        return false;
      }

      await tx.giftViewEvent.create({
        data: {
          giftId: id,
          viewerId,
        },
      });
      await tx.gift.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
      return true;
    });

    return NextResponse.json({ tracked });
  } catch (error) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json({ tracked: false });
    }
    console.error("POST /api/gifts/[id]/view error:", error);
    return NextResponse.json(
      { error: "Không thể ghi nhận lượt xem" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredAssets } from "@/lib/asset-record";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const headerSecret = request.headers.get("x-cron-secret")?.trim();
  if (headerSecret && headerSecret === secret) {
    return true;
  }

  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization) return false;

  if (authorization === `Bearer ${secret}`) {
    return true;
  }
  return false;
}

async function handleCleanup(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : Number.NaN;
  const limit = Number.isFinite(parsedLimit)
    ? Math.max(1, Math.min(parsedLimit, 200))
    : 50;

  try {
    const result = await cleanupExpiredAssets(limit);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("/api/internal/assets/cleanup error:", error);
    return NextResponse.json(
      { error: "Không thể cleanup assets" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleCleanup(request);
}

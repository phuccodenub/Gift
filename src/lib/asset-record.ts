import { prisma } from "@/lib/db";
import { deleteImage } from "@/lib/storage";
import type { Asset } from "@prisma/client";

const DEFAULT_ASSET_TTL_HOURS = 24;

export const ASSET_STATUSES = {
  uploaded: "uploaded",
  attached: "attached",
  pendingDelete: "pending_delete",
  deleted: "deleted",
  failed: "failed",
} as const;

export const ASSET_PROVIDERS = {
  localDev: "local_dev",
  supabase: "supabase",
} as const;

export type AssetProviderValue = typeof ASSET_PROVIDERS[keyof typeof ASSET_PROVIDERS];

export type AssetRecord = Asset;

export function computeAssetExpiry(hours = DEFAULT_ASSET_TTL_HOURS): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function createUploadedAsset(input: {
  id: string;
  provider: AssetProviderValue;
  objectPath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  expiresAt?: Date;
}): Promise<AssetRecord> {
  return prisma.asset.create({
    data: {
      id: input.id,
      provider: input.provider,
      objectPath: input.objectPath,
      publicUrl: input.publicUrl,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      status: ASSET_STATUSES.uploaded,
      giftId: null,
      expiresAt: input.expiresAt ?? computeAssetExpiry(),
    },
  });
}

export async function markAssetsAttached(assetIds: string[], giftId: string): Promise<void> {
  if (!assetIds.length) return;
  await prisma.asset.updateMany({
    where: {
      id: { in: assetIds },
    },
    data: {
      status: ASSET_STATUSES.attached,
      giftId,
      expiresAt: null,
    },
  });
}

export async function scheduleAssetsForCleanup(assetIds: string[], hours = 1): Promise<void> {
  if (!assetIds.length) return;
  await prisma.asset.updateMany({
    where: {
      id: { in: assetIds },
    },
    data: {
      status: ASSET_STATUSES.pendingDelete,
      giftId: null,
      expiresAt: computeAssetExpiry(hours),
    },
  });
}

export async function getAssetsByIds(assetIds: string[]): Promise<AssetRecord[]> {
  if (!assetIds.length) return [];
  return prisma.asset.findMany({
    where: {
      id: { in: assetIds },
    },
  });
}

export async function cleanupExpiredAssets(limit = 50): Promise<{
  scanned: number;
  deleted: number;
  failed: number;
}> {
  const now = new Date();
  const candidates = await prisma.asset.findMany({
    where: {
      giftId: null,
      status: { in: [ASSET_STATUSES.uploaded, ASSET_STATUSES.pendingDelete] },
      expiresAt: { lte: now },
    },
    orderBy: { expiresAt: "asc" },
    take: Math.max(1, Math.min(limit, 200)),
  });

  let deleted = 0;
  let failed = 0;

  for (const asset of candidates) {
    try {
      await deleteImage({
        objectPath: asset.objectPath,
        publicUrl: asset.publicUrl,
      });
      await prisma.asset.deleteMany({ where: { id: asset.id } });
      deleted += 1;
    } catch (error) {
      failed += 1;
      console.error("cleanupExpiredAssets item failed", {
        assetId: asset.id,
        error,
      });
      await prisma.asset.updateMany({
        where: { id: asset.id },
        data: { status: ASSET_STATUSES.failed },
      });
    }
  }

  return {
    scanned: candidates.length,
    deleted,
    failed,
  };
}

-- CreateEnum
CREATE TYPE "AssetProvider" AS ENUM ('local_dev', 'supabase');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('uploaded', 'attached', 'pending_delete', 'deleted', 'failed');

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "provider" "AssetProvider" NOT NULL,
    "objectPath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'uploaded',
    "giftId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- Backfill assets from existing GiftImage rows.
INSERT INTO "Asset" (
    "id",
    "provider",
    "objectPath",
    "publicUrl",
    "mimeType",
    "sizeBytes",
    "status",
    "giftId",
    "createdAt",
    "updatedAt"
)
SELECT
    gi."assetId" AS "id",
    CASE
        WHEN gi."publicUrl" LIKE '%/storage/v1/object/public/%' THEN 'supabase'::"AssetProvider"
        ELSE 'local_dev'::"AssetProvider"
    END AS "provider",
    gi."objectPath",
    gi."publicUrl",
    CASE
        WHEN gi."publicUrl" ILIKE '%.png%' THEN 'image/png'
        WHEN gi."publicUrl" ILIKE '%.webp%' THEN 'image/webp'
        ELSE 'image/jpeg'
    END AS "mimeType",
    0 AS "sizeBytes",
    'attached'::"AssetStatus" AS "status",
    gi."giftId",
    CURRENT_TIMESTAMP AS "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM "GiftImage" gi
ON CONFLICT ("id") DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_objectPath_key" ON "Asset"("objectPath");

-- CreateIndex
CREATE INDEX "Asset_status_expiresAt_idx" ON "Asset"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Asset_giftId_idx" ON "Asset"("giftId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftImage" ADD CONSTRAINT "GiftImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

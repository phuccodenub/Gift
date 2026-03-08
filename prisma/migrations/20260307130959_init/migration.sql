-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "message" TEXT NOT NULL,
    "senderName" TEXT,
    "recipientName" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftImage" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "objectPath" TEXT NOT NULL,
    "label" TEXT,
    "position" JSONB,

    CONSTRAINT "GiftImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftViewEvent" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gift_slug_key" ON "Gift"("slug");

-- CreateIndex
CREATE INDEX "Gift_createdAt_idx" ON "Gift"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GiftImage_assetId_key" ON "GiftImage"("assetId");

-- CreateIndex
CREATE INDEX "GiftImage_giftId_idx" ON "GiftImage"("giftId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftViewEvent_giftId_viewerId_key" ON "GiftViewEvent"("giftId", "viewerId");

-- CreateIndex
CREATE INDEX "GiftViewEvent_giftId_createdAt_idx" ON "GiftViewEvent"("giftId", "createdAt");

-- AddForeignKey
ALTER TABLE "GiftImage" ADD CONSTRAINT "GiftImage_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftViewEvent" ADD CONSTRAINT "GiftViewEvent_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

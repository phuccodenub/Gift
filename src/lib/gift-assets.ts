import { ASSET_STATUSES } from "@/lib/asset-record";
import { normalizeGiftAudio } from "@/lib/gift-effects";
import type { GiftAudioConfig } from "@/types/gift";
import type { Asset, Prisma } from "@prisma/client";

export type RequestedGiftImageInput = {
  assetId: string;
  label?: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
};

export type CreateGiftImageInput = {
  assetId: string;
  publicUrl: string;
  objectPath: string;
  label?: string | null;
  position?: Prisma.InputJsonValue;
};

type GiftAssetKind = "image" | "audio";

function getAssetOrThrow(assetMap: Map<string, Asset>, assetId: string): Asset {
  const asset = assetMap.get(assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} không tồn tại.`);
  }
  return asset;
}

function isAssetOfKind(asset: Asset, kind: GiftAssetKind): boolean {
  if (kind === "image") {
    return asset.mimeType.startsWith("image/");
  }

  return asset.mimeType === "audio/mpeg" || asset.mimeType === "audio/mp3";
}

export function buildImageCreateData(
  requestedImages: RequestedGiftImageInput[],
  assetMap: Map<string, Asset>,
): CreateGiftImageInput[] {
  return requestedImages.map((image) => {
    const asset = getAssetOrThrow(assetMap, image.assetId);

    if (!isAssetOfKind(asset, "image")) {
      throw new Error(`Asset ${image.assetId} không phải ảnh hợp lệ.`);
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

type ConfigWithOptionalAudio = {
  audio?: unknown;
};

export function getConfigAssetIds(config: ConfigWithOptionalAudio): string[] {
  const audio = normalizeGiftAudio(config.audio);
  return audio ? [audio.assetId] : [];
}

export function getStoredAudioConfig(
  config: ConfigWithOptionalAudio,
  assetMap: Map<string, Asset>,
): GiftAudioConfig | undefined {
  const audio = normalizeGiftAudio(config.audio);
  if (!audio) return undefined;

  const asset = getAssetOrThrow(assetMap, audio.assetId);
  if (!isAssetOfKind(asset, "audio")) {
    throw new Error(`Asset ${audio.assetId} không phải file MP3 hợp lệ.`);
  }

  return {
    assetId: asset.id,
    publicUrl: asset.publicUrl,
    objectPath: asset.objectPath,
    mimeType: asset.mimeType,
  };
}

export function buildStoredGiftConfig<T extends ConfigWithOptionalAudio>(
  config: T,
  assetMap: Map<string, Asset>,
): Omit<T, "audio"> & { audio?: GiftAudioConfig } {
  const audio = getStoredAudioConfig(config, assetMap);

  return {
    ...config,
    audio,
  } as Omit<T, "audio"> & { audio?: GiftAudioConfig };
}

export function assertUniqueRequestedAssetIds(assetIds: string[]): void {
  const uniqueIds = new Set(assetIds);
  if (uniqueIds.size !== assetIds.length) {
    throw new Error("Mỗi asset chỉ được sử dụng 1 lần trong gift.");
  }
}

export function assertGiftAssetAssignments(input: {
  assetMap: Map<string, Asset>;
  imageAssetIds?: string[];
  audioAssetIds?: string[];
  blockedAudioAssetIds?: string[];
}): void {
  const imageAssetIds = input.imageAssetIds ?? [];
  const audioAssetIds = input.audioAssetIds ?? [];
  const blockedAudioAssetIds = new Set([
    ...imageAssetIds,
    ...(input.blockedAudioAssetIds ?? []),
  ]);

  imageAssetIds.forEach((assetId) => {
    const asset = getAssetOrThrow(input.assetMap, assetId);
    if (!isAssetOfKind(asset, "image")) {
      throw new Error(`Asset ${assetId} không phải ảnh hợp lệ.`);
    }
  });

  audioAssetIds.forEach((assetId) => {
    if (blockedAudioAssetIds.has(assetId)) {
      throw new Error("Không thể dùng cùng 1 asset cho cả ảnh và nhạc.");
    }

    const asset = getAssetOrThrow(input.assetMap, assetId);
    if (!isAssetOfKind(asset, "audio")) {
      throw new Error(`Asset ${assetId} không phải file MP3 hợp lệ.`);
    }
  });
}

export function validateAttachableAssets(
  assets: Asset[],
  currentGiftId?: string,
): Map<string, Asset> {
  const now = Date.now();
  const assetMap = new Map<string, Asset>();

  for (const asset of assets) {
    const belongsToCurrentGift = currentGiftId && asset.giftId === currentGiftId;
    const isReusableCurrentAsset =
      belongsToCurrentGift && asset.status === ASSET_STATUSES.attached;

    if (asset.status !== ASSET_STATUSES.uploaded && !isReusableCurrentAsset) {
      throw new Error(`Asset ${asset.id} không ở trạng thái khả dụng.`);
    }
    if (asset.giftId && !belongsToCurrentGift) {
      throw new Error(`Asset ${asset.id} đã được gắn vào gift khác.`);
    }
    if (
      asset.expiresAt &&
      asset.expiresAt.getTime() <= now &&
      !belongsToCurrentGift
    ) {
      throw new Error(`Asset ${asset.id} đã hết hạn, vui lòng upload lại.`);
    }

    assetMap.set(asset.id, asset);
  }

  return assetMap;
}

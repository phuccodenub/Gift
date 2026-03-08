import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import type {
  GiftAudioConfig,
  GiftConfig,
  GiftData,
  GiftEffectsConfig,
} from "@/types/gift";

export const MAX_FLOATING_MESSAGES = 8;
export const MAX_FLOATING_MESSAGE_LENGTH = 60;

export type FallingRuntimeItem =
  | {
      id: string;
      kind: "message";
      text: string;
      left: number;
      delay: number;
      duration: number;
      sway: number;
      rotation: number;
      width: number;
    }
  | {
      id: string;
      kind: "image";
      src: string;
      alt?: string;
      left: number;
      delay: number;
      duration: number;
      sway: number;
      rotation: number;
      size: number;
    };

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

export function normalizeFloatingMessages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_FLOATING_MESSAGES)
    .map((item) => item.slice(0, MAX_FLOATING_MESSAGE_LENGTH));
}

export function parseFloatingMessagesInput(value: string): string[] {
  return normalizeFloatingMessages(value.split(/\r?\n/g));
}

export function normalizeGiftAudio(value: unknown): GiftAudioConfig | undefined {
  const raw = asRecord(value);
  if (!raw) return undefined;

  const assetId = typeof raw.assetId === "string" ? raw.assetId.trim() : "";
  const publicUrl = typeof raw.publicUrl === "string" ? raw.publicUrl.trim() : "";
  const objectPath = typeof raw.objectPath === "string" ? raw.objectPath.trim() : "";
  const mimeType = typeof raw.mimeType === "string" ? raw.mimeType.trim() : "";

  if (!assetId || !publicUrl || !objectPath || !mimeType) {
    return undefined;
  }

  return {
    assetId,
    publicUrl,
    objectPath,
    mimeType,
  };
}

export function normalizeGiftEffects(value: unknown): GiftEffectsConfig | undefined {
  const raw = asRecord(value);
  if (!raw) return undefined;

  const fallingMedia =
    typeof raw.fallingMedia === "boolean" ? raw.fallingMedia : undefined;
  const clickBurst = raw.clickBurst === "hearts" ? "hearts" : undefined;

  if (fallingMedia === undefined && clickBurst === undefined) {
    return undefined;
  }

  return {
    fallingMedia,
    clickBurst,
  };
}

function getConfig(target: GiftData | GiftConfig): GiftConfig {
  if ("config" in target) {
    return target.config as GiftConfig;
  }
  return target as GiftConfig;
}

export function getGiftAudioConfig(target: GiftData | GiftConfig): GiftAudioConfig | undefined {
  return normalizeGiftAudio(getConfig(target).audio);
}

export function getGiftEffects(target: GiftData | GiftConfig): GiftEffectsConfig | undefined {
  return normalizeGiftEffects(getConfig(target).effects);
}

export function isFallingMediaEnabled(target: GiftData | GiftConfig): boolean {
  return getGiftEffects(target)?.fallingMedia === true;
}

export function hasClickHeartBurst(target: GiftData | GiftConfig): boolean {
  return getGiftEffects(target)?.clickBurst === "hearts";
}

export function shouldUseLegacyImageLayout(target: GiftData | GiftConfig): boolean {
  return !isFallingMediaEnabled(target);
}

export function shouldUseLegacyFlowerTreeScene(gift: GiftData): boolean {
  return !isFallingMediaEnabled(gift) && Boolean(gift.config.scene?.elements?.length);
}

export function buildFallingRuntimeItems(gift: GiftData): FallingRuntimeItem[] {
  if (!isFallingMediaEnabled(gift)) {
    return [];
  }

  const messages = normalizeFloatingMessages(gift.config.floatingMessages).map((text, index) => ({
    id: `msg-${index}`,
    kind: "message" as const,
    text,
  }));

  const images = gift.images
    .map((image, index) => ({
      id: image.assetId || image.id || `img-${index}`,
      kind: "image" as const,
      src: image.publicUrl || image.url,
      alt: image.label || `Photo ${index + 1}`,
    }))
    .filter((image) => Boolean(image.src));

  if (!messages.length && !images.length) {
    return [];
  }

  const combined: Array<
    { id: string; kind: "message"; text: string } | { id: string; kind: "image"; src: string; alt?: string }
  > = [];
  const maxLen = Math.max(messages.length, images.length);

  for (let index = 0; index < maxLen; index += 1) {
    const message = messages[index];
    if (message) combined.push(message);
    const image = images[index];
    if (image) combined.push(image);
  }

  const random = createDeterministicRandom(
    `${gift.id ?? gift.templateId}:shared-falling:${combined.length}`,
  );
  const lanes = Math.min(Math.max(combined.length, 1), 6);
  const leftMin = 8;
  const leftMax = 92;
  const laneSpan = lanes > 1 ? (leftMax - leftMin) / (lanes - 1) : 0;

  return combined.map((item, index) => {
    const lane = index % lanes;
    const wave = Math.floor(index / lanes);
    const baseLeft = lanes === 1 ? 50 : leftMin + lane * laneSpan;
    const laneJitter = randomInRange(random, -3.8, 3.8);
    const waveOffset = wave % 2 === 0 ? -2.2 : 2.2;
    const left = Math.max(6, Math.min(94, baseLeft + laneJitter + waveOffset));
    const delay = wave * 1.45 + lane * 0.52 + randomInRange(random, 0, 0.35);
    const duration = randomInRange(random, 9, 16);
    const sway = randomInRange(random, 22, 54);
    const rotation = randomInRange(random, -18, 18);

    if (item.kind === "message") {
      return {
        ...item,
        left,
        delay,
        duration,
        sway,
        rotation,
        width: randomInRange(random, 120, 180),
      };
    }

    return {
      ...item,
      left,
      delay,
      duration,
      sway,
      rotation,
      size: randomInRange(random, 74, 112),
    };
  });
}

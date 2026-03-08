import type { GiftData, GiftImageData, SceneElement } from "@/types/gift";
import {
  normalizeFloatingMessages,
  normalizeGiftAudio,
  normalizeGiftEffects,
} from "@/lib/gift-effects";
import { resolveTheme } from "./gift-config";
import { isAllowedAssetUrl } from "./asset-url";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeText(value: string | undefined): string {
  return escapeHtml((value ?? "").trim());
}

export function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function sanitizeAssetUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/^javascript:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
    return "";
  }
  if (!isAllowedAssetUrl(trimmed)) {
    return "";
  }
  return escapeAttribute(trimmed);
}

export function sanitizeImageUrl(value: string): string {
  return sanitizeAssetUrl(value);
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function sanitizeSceneElement(element: SceneElement): SceneElement {
  const allowedType = ["image", "text", "sticker", "shape"].includes(element.type)
    ? element.type
    : "shape";

  const sanitizedStyle =
    element.style && typeof element.style === "object"
      ? Object.entries(element.style).reduce<Record<string, string | number | boolean>>(
          (acc, [key, value]) => {
            if (!/^[a-zA-Z0-9_-]{1,32}$/.test(key)) return acc;
            if (typeof value === "string") {
              acc[key] = sanitizeText(value).slice(0, 100);
            } else if (typeof value === "number" && Number.isFinite(value)) {
              acc[key] = value;
            } else if (typeof value === "boolean") {
              acc[key] = value;
            }
            return acc;
          },
          {},
        )
      : undefined;

  return {
    id: sanitizeText(element.id).slice(0, 80) || "scene-element",
    type: allowedType as SceneElement["type"],
    content: element.content ? sanitizeText(element.content).slice(0, 500) : undefined,
    assetRef: element.assetRef ? sanitizeText(element.assetRef).slice(0, 120) : undefined,
    transform: {
      x: clampNumber(element.transform?.x, 0, -2000, 4000),
      y: clampNumber(element.transform?.y, 0, -2000, 4000),
      width: clampNumber(element.transform?.width, 64, 1, 4000),
      height: clampNumber(element.transform?.height, 64, 1, 4000),
      rotation: clampNumber(element.transform?.rotation ?? 0, 0, -360, 360),
    },
    zIndex: clampNumber(element.zIndex, 1, -100, 2000),
    style: sanitizedStyle,
    animationPreset: element.animationPreset
      ? sanitizeText(element.animationPreset).slice(0, 64)
      : undefined,
  };
}

export function sanitizeGiftForExport(gift: GiftData): GiftData {
  const theme = resolveTheme(gift.config);
  const sceneElements = gift.config.scene?.elements?.length
    ? gift.config.scene.elements.map(sanitizeSceneElement)
    : [];
  const audio = normalizeGiftAudio(gift.config.audio);
  const audioPublicUrl = audio?.publicUrl ? sanitizeAssetUrl(audio.publicUrl) : "";
  const sanitizedAudio =
    audio && audioPublicUrl
      ? {
          ...audio,
          assetId: sanitizeText(audio.assetId),
          objectPath: sanitizeText(audio.objectPath),
          mimeType: sanitizeText(audio.mimeType),
          publicUrl: audioPublicUrl,
        }
      : undefined;

  return {
    ...gift,
    message: sanitizeText(gift.message),
    senderName: sanitizeText(gift.senderName),
    recipientName: sanitizeText(gift.recipientName),
    config: {
      ...gift.config,
      theme,
      colors: theme,
      audio: sanitizedAudio,
      floatingMessages: normalizeFloatingMessages(gift.config.floatingMessages).map(sanitizeText),
      effects: normalizeGiftEffects(gift.config.effects),
      scene: gift.config.scene
        ? {
            ...gift.config.scene,
            elements: sceneElements,
          }
        : undefined,
    },
    images: gift.images
      .map((image): GiftImageData => ({
        ...image,
        url: sanitizeImageUrl(image.url),
        publicUrl: image.publicUrl ? sanitizeImageUrl(image.publicUrl) : undefined,
        objectPath: image.objectPath ? sanitizeText(image.objectPath) : undefined,
        label: sanitizeText(image.label),
      }))
      .filter((image) => Boolean(image.url)),
  };
}

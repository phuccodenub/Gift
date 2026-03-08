import { prisma } from "@/lib/db";
import { resolveTheme } from "@/lib/gift-config";
import {
  normalizeFloatingMessages,
  normalizeGiftAudio,
  normalizeGiftEffects,
} from "@/lib/gift-effects";
import { createGiftSlug } from "@/lib/slug";
import type { Prisma } from "@prisma/client";
import type { GiftConfig, GiftData, GiftImageData } from "@/types/gift";

type GiftWithImages = Prisma.GiftGetPayload<{
  include: { images: true };
}>;

function parsePossiblyStringifiedJson<T>(value: unknown): T | undefined {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  if (value && typeof value === "object") {
    return value as T;
  }
  return undefined;
}

function toGiftConfig(config: unknown): GiftConfig {
  const parsed = parsePossiblyStringifiedJson<Record<string, unknown>>(config) ?? {};
  const raw = parsed;
  const theme = resolveTheme(raw as GiftConfig);

  return {
    ...(raw as GiftConfig),
    colors: theme,
    theme: raw.theme && typeof raw.theme === "object"
      ? {
          primary: String((raw.theme as Record<string, unknown>).primary ?? theme.primary),
          secondary: String((raw.theme as Record<string, unknown>).secondary ?? theme.secondary),
          accent: String((raw.theme as Record<string, unknown>).accent ?? theme.accent),
          background: String((raw.theme as Record<string, unknown>).background ?? theme.background),
        }
      : {
          primary: theme.primary,
          secondary: theme.secondary,
          accent: theme.accent,
          background: theme.background,
        },
    animation: raw.animation && typeof raw.animation === "object"
      ? {
          speed:
            (raw.animation as Record<string, unknown>).speed === "slow" ||
            (raw.animation as Record<string, unknown>).speed === "fast"
              ? ((raw.animation as Record<string, unknown>).speed as "slow" | "fast")
              : "normal",
          style: String((raw.animation as Record<string, unknown>).style ?? "fade"),
        }
      : { speed: "normal", style: "fade" },
    audio: normalizeGiftAudio(raw.audio),
    floatingMessages: normalizeFloatingMessages(raw.floatingMessages),
    effects: normalizeGiftEffects(raw.effects),
    decorations: Array.isArray(raw.decorations)
      ? (raw.decorations as { type: string; variant: string }[])
      : [],
  };
}

function toGiftImageData(image: GiftWithImages["images"][number]): GiftImageData {
  const parsedPosition = parsePossiblyStringifiedJson<GiftImageData["position"]>(image.position);
  const effectiveUrl = image.publicUrl || "";

  return {
    id: image.id,
    assetId: image.assetId ?? undefined,
    url: effectiveUrl,
    publicUrl: image.publicUrl ?? undefined,
    objectPath: image.objectPath ?? undefined,
    label: image.label ?? undefined,
    position: parsedPosition,
  };
}

export function toGiftData(gift: GiftWithImages): GiftData {
  return {
    id: gift.id,
    slug: gift.slug ?? undefined,
    templateId: gift.templateId,
    config: toGiftConfig(gift.config),
    message: gift.message,
    senderName: gift.senderName ?? undefined,
    recipientName: gift.recipientName ?? undefined,
    images: gift.images.map(toGiftImageData),
    viewCount: gift.viewCount ?? 0,
    createdAt: gift.createdAt.toISOString(),
  };
}

export async function findGiftBySlugOrId(slugOrId: string): Promise<GiftWithImages | null> {
  try {
    return await prisma.gift.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: { images: true },
    });
  } catch {
    return prisma.gift.findUnique({
      where: { id: slugOrId },
      include: { images: true },
    });
  }
}

export async function createUniqueGiftSlug(input: {
  templateId: string;
  senderName?: string;
  recipientName?: string;
}): Promise<string> {
  const baseSlug = createGiftSlug(input);
  let candidate = baseSlug;
  let attempt = 1;

  while (attempt <= 30) {
    try {
      const existing = await prisma.gift.findUnique({ where: { slug: candidate } });
      if (!existing) {
        return candidate;
      }
    } catch {
      return `${baseSlug}-${Date.now()}`;
    }
    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

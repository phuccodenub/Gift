import { z } from "zod";
import type { CustomField } from "@/types/gift";
import {
  MAX_FLOATING_MESSAGES,
  MAX_FLOATING_MESSAGE_LENGTH,
} from "@/lib/gift-effects";

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Màu không hợp lệ.");

const DANGEROUS_PATTERNS = /(<script|<\/script|javascript:|vbscript:|on\w+\s*=)/i;

function safeText(maxLen: number) {
  return z
    .string()
    .trim()
    .max(maxLen)
    .refine((v) => !DANGEROUS_PATTERNS.test(v), {
      message: "Nội dung chứa ký tự không hợp lệ.",
    });
}

const positionSchema = z
  .object({
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    rotation: z.number().optional(),
  })
  .optional();

const imageSchema = z.object({
  assetId: z.string().trim().min(8),
  label: z.string().max(80).optional(),
  position: positionSchema,
}).strict();

const audioSchema = z.object({
  assetId: z.string().trim().min(8),
  publicUrl: z.string().trim().min(1),
  objectPath: z.string().trim().min(1),
  mimeType: z.enum(["audio/mpeg", "audio/mp3"]),
}).strict();

const giftConfigSchema = z.object({
  theme: z
    .object({
      primary: hexColor,
      secondary: hexColor,
      accent: hexColor,
      background: hexColor,
    })
    .optional(),
  colors: z
    .object({
      primary: hexColor,
      secondary: hexColor,
      accent: hexColor,
      background: hexColor,
    })
    .optional(),
  decorations: z.array(z.object({ type: z.string(), variant: z.string() })).default([]),
  animation: z.object({
    speed: z.enum(["slow", "normal", "fast"]).default("normal"),
    style: z.string().min(1).max(40),
  }),
  audio: audioSchema.optional(),
  floatingMessages: z
    .array(safeText(MAX_FLOATING_MESSAGE_LENGTH).pipe(z.string().min(1)))
    .max(MAX_FLOATING_MESSAGES)
    .optional(),
  effects: z
    .object({
      fallingMedia: z.boolean().optional(),
      clickBurst: z.literal("hearts").optional(),
    })
    .optional(),
  letterHeading: safeText(120).optional(),
  letterSignature: safeText(120).optional(),
  scene: z
    .object({
      elements: z
        .array(
          z.object({
            id: z.string(),
            type: z.enum(["image", "text", "sticker", "shape"]),
            content: z.string().optional(),
            assetRef: z.string().optional(),
            transform: z.object({
              x: z.number(),
              y: z.number(),
              width: z.number().positive(),
              height: z.number().positive(),
              rotation: z.number().optional(),
            }),
            zIndex: z.number(),
            style: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
            animationPreset: z.string().optional(),
          }),
        )
        .default([]),
      parallax: z.boolean().optional(),
    })
    .optional(),
});

export const createGiftRequestSchema = z.object({
  templateId: z.string().min(1),
  message: safeText(500).pipe(z.string().min(1)),
  senderName: safeText(50).optional(),
  recipientName: safeText(50).optional(),
  config: giftConfigSchema,
  images: z.array(imageSchema).max(5).optional(),
}).strict();

export const updateGiftRequestSchema = z
  .object({
    message: safeText(500).pipe(z.string().min(1)).optional(),
    senderName: safeText(50).optional(),
    recipientName: safeText(50).optional(),
    config: giftConfigSchema.optional(),
  })
  .strict();

export const viewBeaconSchema = z.object({
  viewerId: z.string().trim().min(8).max(80),
});

export function assertTemplateFieldsValue(fields: CustomField[], values: Record<string, unknown>) {
  const fieldKeys = new Set(fields.map((field) => field.key));
  return Object.keys(values).every((key) => fieldKeys.has(key) || key.startsWith("colors."));
}

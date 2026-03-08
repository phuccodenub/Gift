import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { UploadAssetResponse } from "@/types/gift";
import {
  getSupabaseStoragePrefix,
  isAllowedAssetUrl,
  toAbsoluteUrl,
} from "./asset-url";
export { isAllowedAssetUrl };

export const STORAGE_PROVIDERS = {
  localDev: "local_dev",
  supabase: "supabase",
} as const;

export type AssetProviderValue = typeof STORAGE_PROVIDERS[keyof typeof STORAGE_PROVIDERS];

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const STORAGE_MODE = process.env.STORAGE_MODE || "local-dev";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "gift-assets";

function normalizeAssetMimeType(mimeType: string | undefined): string {
  const normalized = mimeType?.trim().toLowerCase() ?? "";
  if (normalized === "image/jpg") return "image/jpeg";
  if (normalized === "audio/mp3") return "audio/mpeg";
  return normalized;
}

function getExtFromMimeType(mimeType: string | undefined): string | undefined {
  const normalized = normalizeAssetMimeType(mimeType);
  if (normalized === "image/jpeg") return "jpg";
  if (normalized === "image/png") return "png";
  if (normalized === "image/webp") return "webp";
  if (normalized === "audio/mpeg") return "mp3";
  return undefined;
}

function ensureSafeExt(filename: string, mimeType?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "mp3"].includes(ext)) {
    return ext;
  }
  const extFromMimeType = getExtFromMimeType(mimeType);
  if (extFromMimeType) {
    return extFromMimeType;
  }
  return "jpg";
}

function getMimeFromExt(value: string): string {
  const ext = value.split(".").pop()?.toLowerCase() ?? "jpg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "mp3") return "audio/mpeg";
  return "image/jpeg";
}

function isSupabaseEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function shouldUseSupabase() {
  return STORAGE_MODE === "supabase" && isSupabaseEnabled();
}

function createSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase server credentials.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function getAssetProviderFromUrl(url: string): AssetProviderValue {
  const supabasePrefix = getSupabaseStoragePrefix();
  if (supabasePrefix && url.startsWith(supabasePrefix)) {
    return STORAGE_PROVIDERS.supabase;
  }
  return STORAGE_PROVIDERS.localDev;
}

export function resolveObjectPathFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.replace("/uploads/", "");
  }

  if (trimmed.startsWith("/assets/")) {
    return trimmed.replace("/assets/", "assets/");
  }

  const parsed = toAbsoluteUrl(trimmed);
  if (!parsed) return null;

  if (parsed.pathname.startsWith("/uploads/")) {
    return parsed.pathname.replace("/uploads/", "");
  }

  if (parsed.pathname.startsWith("/assets/")) {
    return parsed.pathname.replace("/assets/", "assets/");
  }

  const marker = "/storage/v1/object/public/";
  const markerIndex = parsed.pathname.indexOf(marker);
  if (markerIndex >= 0) {
    const pathAfterMarker = parsed.pathname.slice(markerIndex + marker.length);
    const [bucket, ...rest] = pathAfterMarker.split("/");
    if (!bucket || !rest.length) return null;
    return rest.join("/");
  }

  return null;
}

export async function uploadAsset(file: File): Promise<UploadAssetResponse> {
  const mimeType = normalizeAssetMimeType(file.type) || getMimeFromExt(file.name);
  const ext = ensureSafeExt(file.name, mimeType);
  const assetId = randomUUID();
  const objectPath = `${assetId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const sizeBytes = buffer.byteLength;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  if (shouldUseSupabase()) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, buffer, {
        contentType: mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);
    return {
      assetId,
      publicUrl: data.publicUrl,
      objectPath,
      mimeType,
      sizeBytes,
      expiresAt,
      provider: STORAGE_PROVIDERS.supabase,
    };
  }

  await ensureUploadDir();
  const filepath = path.join(UPLOAD_DIR, objectPath);
  await fs.writeFile(filepath, buffer);

  return {
    assetId,
    publicUrl: `/uploads/${objectPath}`,
    objectPath,
    mimeType,
    sizeBytes,
    expiresAt,
    provider: STORAGE_PROVIDERS.localDev,
  };
}

export async function uploadImage(file: File): Promise<UploadAssetResponse> {
  return uploadAsset(file);
}

export async function deleteAsset(asset: { objectPath?: string; publicUrl?: string }): Promise<void> {
  const objectPath = asset.objectPath?.trim();
  if (!objectPath) return;

  if (shouldUseSupabase()) {
    const supabase = createSupabaseAdminClient();
    await supabase.storage.from(SUPABASE_BUCKET).remove([objectPath]);
    return;
  }

  const filepath = path.join(UPLOAD_DIR, objectPath);
  await fs.unlink(filepath).catch(() => {});
}

export async function deleteImage(asset: { objectPath?: string; publicUrl?: string }): Promise<void> {
  await deleteAsset(asset);
}

export async function assetToDataUri(
  url: string,
  expectedContentPrefix?: "image/" | "audio/",
): Promise<string> {
  if (!isAllowedAssetUrl(url)) {
    throw new Error("Asset URL is not allowed for export.");
  }

  if (url.startsWith("data:image/") || url.startsWith("data:audio/")) {
    return url;
  }

  if (url.startsWith("/uploads/") || url.startsWith("/assets/")) {
    const relativePath = url.startsWith("/") ? url.slice(1) : url;
    const filepath = path.join(process.cwd(), "public", relativePath);
    const buffer = await fs.readFile(filepath);
    const mime = getMimeFromExt(url);
    if (expectedContentPrefix && !mime.startsWith(expectedContentPrefix)) {
      throw new Error(`Local asset is not ${expectedContentPrefix.slice(0, -1)}.`);
    }
    if (
      !expectedContentPrefix &&
      !mime.startsWith("image/") &&
      !mime.startsWith("audio/")
    ) {
      throw new Error("Local asset has unsupported content type.");
    }
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }

  const supabasePrefix = getSupabaseStoragePrefix();
  if (!supabasePrefix || !url.startsWith(supabasePrefix)) {
    throw new Error("Only whitelisted storage URLs can be fetched for export.");
  }

  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Cannot fetch asset: ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  if (expectedContentPrefix && !contentType.startsWith(expectedContentPrefix)) {
    throw new Error(`Fetched asset is not ${expectedContentPrefix.slice(0, -1)}.`);
  }
  if (!expectedContentPrefix && !contentType.startsWith("image/") && !contentType.startsWith("audio/")) {
    throw new Error("Fetched asset has unsupported content type.");
  }
  const body = await response.arrayBuffer();
  return `data:${contentType};base64,${Buffer.from(body).toString("base64")}`;
}

export async function imageToBase64(url: string): Promise<string> {
  return assetToDataUri(url, "image/");
}

export async function audioToDataUri(url: string): Promise<string> {
  return assetToDataUri(url, "audio/");
}

/**
 * Isomorphic (server + client) URL utilities for asset validation.
 * No Node.js-only imports — safe to import from client-side modules.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "gift-assets";

export function getSupabaseStoragePrefix(): string | null {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`;
}

export function toAbsoluteUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function getAllowedOrigins(): string[] {
  const candidates = [
    process.env.APP_URL?.trim(),
    process.env.NEXT_PUBLIC_APP_URL?.trim(),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter((value): value is string => Boolean(value));

  const resolved = candidates
    .map((value) => toAbsoluteUrl(value)?.origin ?? null)
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(resolved));
}

export function isAllowedAssetUrl(url: string): boolean {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/assets/") ||
    trimmed.startsWith("data:image/")
  ) {
    return true;
  }

  const parsed = toAbsoluteUrl(trimmed);
  if (
    parsed &&
    (parsed.pathname.startsWith("/uploads/") || parsed.pathname.startsWith("/assets/"))
  ) {
    if (getAllowedOrigins().includes(parsed.origin)) {
      return true;
    }
  }

  const supabasePrefix = getSupabaseStoragePrefix();
  if (supabasePrefix && trimmed.startsWith(supabasePrefix)) {
    return true;
  }
  return false;
}

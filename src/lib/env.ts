function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeAbsoluteUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    return trimTrailingSlash(parsed.toString());
  } catch {
    return null;
  }
}

export function getServerBaseUrl(): string {
  const appUrl = normalizeAbsoluteUrl(process.env.APP_URL ?? "");
  if (appUrl) {
    return appUrl;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("APP_URL is required in production.");
}

export function getClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }
  const publicUrl = normalizeAbsoluteUrl(process.env.NEXT_PUBLIC_APP_URL ?? "");
  if (publicUrl) {
    return publicUrl;
  }
  return getServerBaseUrl();
}

import type { GiftConfig, GiftTheme } from "@/types/gift";

const FALLBACK_THEME: GiftTheme = {
  primary: "#ec4899",
  secondary: "#a855f7",
  accent: "#f43f5e",
  background: "#fdf2f8",
};

function normalizeHexColor(color: string, fallback: string): string {
  const trimmed = color.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

export function resolveTheme(config: GiftConfig): GiftTheme {
  const source = config.theme ?? config.colors ?? FALLBACK_THEME;
  return {
    primary: normalizeHexColor(source.primary, FALLBACK_THEME.primary),
    secondary: normalizeHexColor(source.secondary, FALLBACK_THEME.secondary),
    accent: normalizeHexColor(source.accent, FALLBACK_THEME.accent),
    background: normalizeHexColor(source.background, FALLBACK_THEME.background),
  };
}

import type { GiftData } from "@/types/gift";
import { getTemplate } from "@/components/templates/registry";
import { sanitizeGiftForExport } from "@/lib/export-sanitize";
import { buildSharedExportRuntime } from "@/lib/export-runtime";

export function generateExportHTML(gift: GiftData): string {
  const template = getTemplate(gift.templateId);
  if (!template) {
    throw new Error(`Template "${gift.templateId}" not found`);
  }
  return template.renderExport(sanitizeGiftForExport(gift));
}

export function wrapExportHTML(
  title: string,
  css: string,
  bodyHTML: string,
  js: string,
  gift?: GiftData,
): string {
  const runtime = buildSharedExportRuntime(gift);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${css}${runtime.css}</style>
</head>
<body>
  ${bodyHTML}
  ${runtime.bodyHTML}
  <script>${js}${runtime.js}</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

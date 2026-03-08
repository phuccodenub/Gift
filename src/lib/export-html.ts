import type { GiftData } from "@/types/gift";
import { getTemplate } from "@/components/templates/registry";
import { sanitizeGiftForExport } from "@/lib/export-sanitize";

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
): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  ${bodyHTML}
  <script>${js}</script>
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

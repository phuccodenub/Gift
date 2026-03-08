const NON_ALNUM = /[^a-z0-9]+/g;

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(NON_ALNUM, "-")
    .replace(/^-+|-+$/g, "");

  return base || "gift";
}

export function createGiftSlug(params: {
  templateId: string;
  recipientName?: string;
  senderName?: string;
}): string {
  const seedParts = [params.templateId, params.recipientName, params.senderName]
    .filter((value) => Boolean(value && value.trim()))
    .join("-");
  const base = slugify(seedParts || params.templateId);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

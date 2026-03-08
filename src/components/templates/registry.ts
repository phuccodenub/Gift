import type { GiftTemplate } from "@/types/gift";
import { bouquetTemplate } from "./bouquet/config";
import { greetingCardTemplate } from "./greeting-card/config";
import { envelopeTemplate } from "./envelope/config";
import { flowerTreeTemplate } from "./flower-tree/config";

const templateRegistry = new Map<string, GiftTemplate>();

function registerTemplate(template: GiftTemplate) {
  templateRegistry.set(template.id, template);
}

registerTemplate(bouquetTemplate);
registerTemplate(greetingCardTemplate);
registerTemplate(envelopeTemplate);
registerTemplate(flowerTreeTemplate);

export function getTemplate(id: string): GiftTemplate | undefined {
  return templateRegistry.get(id);
}

export function getAllTemplates(): GiftTemplate[] {
  return Array.from(templateRegistry.values());
}

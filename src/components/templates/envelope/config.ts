import type { GiftTemplate } from "@/types/gift";
import { EnvelopeGift } from "./EnvelopeGift";
import { generateEnvelopeExportHTML } from "./export";

export const envelopeTemplate: GiftTemplate = {
  id: "envelope",
  name: "Phong Bì Yêu Thương",
  description:
    "Phong bì bí mật với hiệu ứng mở ra, confetti và lời nhắn cảm động",
  thumbnail: "/assets/thumbnails/envelope.svg",
  defaultConfig: {
    colors: {
      primary: "#be123c",
      secondary: "#7c3aed",
      accent: "#fde68a",
      background: "#1a1a2e",
    },
    decorations: [{ type: "confetti", variant: "colorful" }],
    animation: { speed: "normal", style: "unfold" },
  },
  customizableFields: [
    { key: "colors.primary", label: "Màu phong bì", type: "color" },
    { key: "colors.secondary", label: "Màu gradient", type: "color" },
    { key: "colors.background", label: "Màu nền", type: "color" },
    {
      key: "animation.speed",
      label: "Tốc độ mở",
      type: "select",
      options: [
        { value: "slow", label: "Chậm" },
        { value: "normal", label: "Vừa" },
        { value: "fast", label: "Nhanh" },
      ],
    },
  ],
  presetThemes: [
    {
      primary: "#be123c",
      secondary: "#7c3aed",
      accent: "#fde68a",
      background: "#1a1a2e",
    },
  ],
  assetSlots: [{ id: "envelope-photos", type: "image", maxItems: 5 }],
  editorSchema: { mode: "slot-editor", supportsFreeform: false },
  renderWeb: EnvelopeGift,
  renderExport: generateEnvelopeExportHTML,
};

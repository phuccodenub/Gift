import type { GiftTemplate } from "@/types/gift";
import { GreetingCardGift } from "./GreetingCardGift";
import { generateGreetingCardExportHTML } from "./export";

export const greetingCardTemplate: GiftTemplate = {
  id: "greeting-card",
  name: "Thiệp Chúc Mừng",
  description: "Thiệp chúc mừng đẹp với hiệu ứng lật mở 3D và lời chúc bên trong",
  thumbnail: "/assets/thumbnails/greeting-card.svg",
  defaultConfig: {
    colors: {
      primary: "#e11d48",
      secondary: "#9333ea",
      accent: "#f472b6",
      background: "#fdf2f8",
    },
    decorations: [{ type: "heart", variant: "classic" }],
    animation: { speed: "normal", style: "flip" },
  },
  customizableFields: [
    { key: "colors.primary", label: "Màu thiệp chính", type: "color" },
    { key: "colors.secondary", label: "Màu gradient phụ", type: "color" },
    { key: "colors.background", label: "Màu nền", type: "color" },
    {
      key: "animation.speed",
      label: "Tốc độ lật thiệp",
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
      primary: "#e11d48",
      secondary: "#9333ea",
      accent: "#f472b6",
      background: "#fdf2f8",
    },
  ],
  assetSlots: [{ id: "greeting-photos", type: "image", maxItems: 3 }],
  editorSchema: { mode: "slot-editor", supportsFreeform: false },
  renderWeb: GreetingCardGift,
  renderExport: generateGreetingCardExportHTML,
};

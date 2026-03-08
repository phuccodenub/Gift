import type { GiftTemplate } from "@/types/gift";
import { FlowerTreeGift } from "./FlowerTreeGift";
import { generateFlowerTreeExportHTML } from "./export";

export const flowerTreeTemplate: GiftTemplate = {
  id: "flower-tree",
  name: "Cây Hoa Huyền Diệu",
  description:
    "Cây hoa tương tác với ảnh cá nhân, hiệu ứng nở hoa và nền trời sao lãng mạn",
  thumbnail: "/assets/thumbnails/flower-tree.svg",
  defaultConfig: {
    colors: {
      primary: "#f472b6",
      secondary: "#a78bfa",
      accent: "#fb923c",
      background: "#0f172a",
    },
    decorations: [{ type: "star", variant: "twinkle" }],
    animation: { speed: "normal", style: "grow" },
    floatingMessages: [],
    effects: { fallingMedia: true, clickBurst: "hearts" },
  },
  customizableFields: [
    { key: "colors.primary", label: "Màu hoa chính", type: "color" },
    { key: "colors.secondary", label: "Màu hoa phụ", type: "color" },
    { key: "colors.accent", label: "Màu điểm nhấn", type: "color" },
    { key: "colors.background", label: "Màu nền trời", type: "color" },
    {
      key: "animation.speed",
      label: "Tốc độ animation",
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
      primary: "#f472b6",
      secondary: "#a78bfa",
      accent: "#fb923c",
      background: "#0f172a",
    },
  ],
  assetSlots: [{ id: "flower-tree-photos", type: "image", maxItems: 5 }],
  editorSchema: { mode: "scene-editor-2.5d", supportsFreeform: true },
  renderWeb: FlowerTreeGift,
  renderExport: generateFlowerTreeExportHTML,
};

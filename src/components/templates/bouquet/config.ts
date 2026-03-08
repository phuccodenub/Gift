import type { GiftTemplate } from "@/types/gift";
import { BouquetGift } from "./BouquetGift";
import { generateBouquetExportHTML } from "./export";

export const bouquetTemplate: GiftTemplate = {
  id: "bouquet",
  name: "Bó Hoa Ngày 8/3",
  description:
    "Bó hoa ảo tuyệt đẹp với hiệu ứng nở hoa, cánh hoa rơi và lời chúc cá nhân hóa",
  thumbnail: "/assets/thumbnails/bouquet.svg",
  defaultConfig: {
    colors: {
      primary: "#f43f5e",
      secondary: "#a855f7",
      accent: "#ec4899",
      background: "#fdf2f8",
    },
    decorations: [{ type: "petal", variant: "rose" }],
    animation: { speed: "normal", style: "bloom" },
    floatingMessages: [],
    effects: { fallingMedia: true, clickBurst: "hearts" },
  },
  customizableFields: [
    { key: "colors.primary", label: "Màu hoa chính", type: "color" },
    { key: "colors.secondary", label: "Màu hoa phụ", type: "color" },
    { key: "colors.accent", label: "Màu điểm nhấn", type: "color" },
    { key: "colors.background", label: "Màu nền", type: "color" },
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
      primary: "#f43f5e",
      secondary: "#a855f7",
      accent: "#ec4899",
      background: "#fdf2f8",
    },
  ],
  assetSlots: [{ id: "bouquet-photos", type: "image", maxItems: 4 }],
  editorSchema: { mode: "slot-editor", supportsFreeform: false },
  renderWeb: BouquetGift,
  renderExport: generateBouquetExportHTML,
};

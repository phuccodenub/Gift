export type BouquetThemeColors = {
  primary: string;
  secondary: string;
  accent?: string;
};

type BouquetStemColorSlot = 0 | 1 | 2;

type BouquetStemBaseSpec = {
  xOffset: number;
  angle: number;
  stemH: number;
  headSize: number;
  colorSlot: BouquetStemColorSlot;
  delay: number;
  zIndex: number;
  leafSide?: "left" | "right";
};

export type BouquetStemSpec = Omit<BouquetStemBaseSpec, "colorSlot"> & {
  color: string;
};

export const BOUQUET_LAYOUT = {
  sceneWidth: 360,
  sceneHeight: 430,
  stemOriginBottom: 136,
  glowTop: 4,
  glowWidth: 320,
  glowHeight: 220,
  wrapWidth: 228,
  wrapHeight: 138,
} as const;

export const BOUQUET_PETAL_ANGLES = [0, 60, 120, 180, 240, 300] as const;

const BOUQUET_STEM_BASE_SPECS: BouquetStemBaseSpec[] = [
  { xOffset: 0, angle: 0, stemH: 208, headSize: 64, colorSlot: 0, delay: 0.18, zIndex: 6, leafSide: "right" },
  { xOffset: -12, angle: -8, stemH: 194, headSize: 58, colorSlot: 1, delay: 0.24, zIndex: 5, leafSide: "left" },
  { xOffset: 12, angle: 8, stemH: 194, headSize: 58, colorSlot: 2, delay: 0.28, zIndex: 5, leafSide: "right" },
  { xOffset: -28, angle: -18, stemH: 172, headSize: 54, colorSlot: 2, delay: 0.34, zIndex: 4, leafSide: "left" },
  { xOffset: 28, angle: 18, stemH: 172, headSize: 54, colorSlot: 1, delay: 0.38, zIndex: 4, leafSide: "right" },
  { xOffset: -46, angle: -30, stemH: 148, headSize: 46, colorSlot: 0, delay: 0.44, zIndex: 3, leafSide: "left" },
  { xOffset: 46, angle: 30, stemH: 148, headSize: 46, colorSlot: 2, delay: 0.48, zIndex: 3, leafSide: "right" },
  { xOffset: -64, angle: -40, stemH: 126, headSize: 40, colorSlot: 1, delay: 0.54, zIndex: 2, leafSide: "left" },
  { xOffset: 64, angle: 40, stemH: 126, headSize: 40, colorSlot: 0, delay: 0.58, zIndex: 2, leafSide: "right" },
];

export function getBouquetPalette(colors: BouquetThemeColors): [string, string, string] {
  return [colors.primary, colors.secondary, colors.accent || colors.primary];
}

export function getBouquetStemSpecs(colors: BouquetThemeColors): BouquetStemSpec[] {
  const palette = getBouquetPalette(colors);

  return BOUQUET_STEM_BASE_SPECS.map((spec) => ({
    ...spec,
    color: palette[spec.colorSlot],
  }));
}

export function getBouquetStemWidth(headSize: number): number {
  return Math.max(4, Math.round(headSize * 0.08));
}

export function getBouquetLeafWidth(headSize: number): number {
  return Math.max(24, Math.round(headSize * 0.52));
}

export function getBouquetLeafHeight(headSize: number): number {
  return Math.max(12, Math.round(headSize * 0.28));
}

export function getBouquetHeadTop(headSize: number): number {
  return -headSize * 0.48;
}

export function getBouquetCalyxWidth(headSize: number): number {
  return Math.max(18, Math.round(headSize * 0.34));
}

export function getBouquetCalyxHeight(headSize: number): number {
  return Math.max(12, Math.round(headSize * 0.16));
}

export function getBouquetOuterPetalWidth(headSize: number): number {
  return headSize * 0.28;
}

export function getBouquetOuterPetalHeight(headSize: number): number {
  return headSize * 0.56;
}

export function getBouquetInnerPetalWidth(headSize: number): number {
  return headSize * 0.18;
}

export function getBouquetInnerPetalHeight(headSize: number): number {
  return headSize * 0.34;
}

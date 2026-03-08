import type { GiftData, GiftImageData, GiftScene, SceneElement } from "@/types/gift";

const DEFAULT_PHOTO_POSITIONS = [
  { x: 30, y: 40 },
  { x: 230, y: 35 },
  { x: 10, y: 140 },
  { x: 250, y: 140 },
];

function normalizeSceneElements(value: unknown): SceneElement[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SceneElement => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as SceneElement;
    return Boolean(
      candidate.id &&
        candidate.type &&
        candidate.transform &&
        typeof candidate.transform.x === "number" &&
        typeof candidate.transform.y === "number" &&
        typeof candidate.transform.width === "number" &&
        typeof candidate.transform.height === "number",
    );
  });
}

export function getFlowerTreeScene(gift: GiftData): GiftScene | undefined {
  const scene = gift.config.scene;
  if (!scene || typeof scene !== "object") return undefined;
  return {
    ...scene,
    elements: normalizeSceneElements(scene.elements),
  };
}

export function buildDefaultFlowerTreeScene(images: GiftImageData[]): GiftScene {
  const imageElements: SceneElement[] = images.slice(0, 4).map((image, index) => {
    const position = image.position ?? {
      x: DEFAULT_PHOTO_POSITIONS[index]?.x ?? 20,
      y: DEFAULT_PHOTO_POSITIONS[index]?.y ?? 20 + index * 16,
      width: 64,
      height: 64,
      rotation: 0,
    };

    return {
      id: `photo-${index + 1}`,
      type: "image",
      content: image.label || undefined,
      assetRef: image.assetId,
      transform: {
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height,
        rotation: position.rotation ?? 0,
      },
      zIndex: 20 + index,
      animationPreset: "bubble-float",
      style: {
        shape: "circle",
      },
    };
  });

  return {
    elements: imageElements,
    parallax: true,
  };
}

export function mergeFlowerTreeScene(
  giftConfig: GiftData["config"],
  images: GiftImageData[],
): GiftData["config"] {
  if (giftConfig.scene?.elements?.length) {
    return giftConfig;
  }

  return {
    ...giftConfig,
    scene: buildDefaultFlowerTreeScene(images),
  };
}

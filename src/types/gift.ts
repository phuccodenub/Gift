export interface GiftConfig {
  theme?: GiftTheme;
  scene?: GiftScene;
  animation: {
    speed: "slow" | "normal" | "fast";
    style: string;
  };
  message?: GiftMessageConfig;
  audio?: GiftAudioConfig;
  floatingMessages?: string[];
  effects?: GiftEffectsConfig;
  letterHeading?: string;
  letterSignature?: string;
  // Legacy keys are kept for backward compatibility during migration.
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  decorations: { type: string; variant: string }[];
  [key: string]: unknown;
}

export interface GiftTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface GiftAudioConfig {
  assetId: string;
  publicUrl: string;
  objectPath: string;
  mimeType: string;
}

export interface GiftEffectsConfig {
  fallingMedia?: boolean;
  clickBurst?: "hearts";
}

export interface GiftMessageConfig {
  layout?: "card" | "popup" | "inline";
  fontFamily?: string;
  fontSize?: number;
}

export interface GiftScene {
  elements: SceneElement[];
  parallax?: boolean;
}

export interface SceneElement {
  id: string;
  type: "image" | "text" | "sticker" | "shape";
  content?: string;
  assetRef?: string;
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
  zIndex: number;
  style?: Record<string, string | number | boolean>;
  animationPreset?: string;
}

export interface GiftImageData {
  id?: string;
  assetId?: string;
  url: string;
  publicUrl?: string;
  objectPath?: string;
  mimeType?: string;
  sizeBytes?: number;
  label?: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
}

export interface GiftData {
  id?: string;
  slug?: string;
  templateId: string;
  config: GiftConfig;
  message: string;
  senderName?: string;
  recipientName?: string;
  images: GiftImageData[];
  viewCount?: number;
  createdAt?: string;
}

export interface CustomField {
  key: string;
  label: string;
  type: "color" | "select" | "text" | "range" | "toggle";
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean;
}

export interface GiftViewerProps {
  gift: GiftData;
  isPreview?: boolean;
}

export interface GiftTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  defaultConfig: GiftConfig;
  customizableFields: CustomField[];
  // New contract
  renderWeb: React.ComponentType<GiftViewerProps>;
  renderExport: (gift: GiftData) => string;
  editorSchema?: Record<string, unknown>;
  presetThemes?: GiftTheme[];
  assetSlots?: TemplateSlot[];
}

export interface TemplateSlot {
  id: string;
  type: "image" | "text" | "sticker";
  maxItems?: number;
  required?: boolean;
}

export interface CreateGiftRequest {
  templateId: string;
  config: GiftConfig;
  message: string;
  senderName?: string;
  recipientName?: string;
  images?: GiftImageData[];
}

export interface GiftResponse {
  id: string;
  slug: string;
  shareUrl: string;
  gift: GiftData;
}

export interface UploadAssetResponse {
  assetId: string;
  publicUrl: string;
  objectPath: string;
  mimeType: string;
  sizeBytes: number;
  expiresAt: string;
  provider: "local_dev" | "supabase";
}

export interface ViewBeaconPayload {
  viewerId: string;
}

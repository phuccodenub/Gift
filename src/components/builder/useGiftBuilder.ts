"use client";

import { useState, useCallback, useMemo } from "react";
import { mergeFlowerTreeScene } from "@/lib/flower-tree-scene";
import { getAllTemplates, getTemplate } from "@/components/templates/registry";
import { STEPS, type StepKey } from "@/components/builder/StepIndicator";
import type {
  GiftConfig,
  GiftData,
  GiftImageData,
  GiftResponse,
  GiftTemplate,
  SceneElement,
} from "@/types/gift";

const DEFAULT_CONFIG: GiftConfig = {
  colors: {
    primary: "#ec4899",
    secondary: "#a855f7",
    accent: "#f43f5e",
    background: "#fdf2f8",
  },
  decorations: [],
  animation: { speed: "normal", style: "fade" },
};

function applyNestedValue(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
) {
  const segments = path.split(".");
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    const current = cursor[key];
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
}

export function useGiftBuilder() {
  const templates = getAllTemplates();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftResponse, setGiftResponse] = useState<GiftResponse | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [images, setImages] = useState<GiftImageData[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});
  const [sceneElements, setSceneElements] = useState<SceneElement[]>([]);

  const selectedTemplate: GiftTemplate | undefined = useMemo(
    () => (selectedTemplateId ? getTemplate(selectedTemplateId) : undefined),
    [selectedTemplateId],
  );

  const currentConfig: GiftConfig = useMemo(() => {
    const base = structuredClone(selectedTemplate?.defaultConfig ?? DEFAULT_CONFIG);
    const config = base as unknown as Record<string, unknown>;

    Object.entries(customValues).forEach(([key, value]) => {
      if (value === undefined) return;
      applyNestedValue(config, key, value);
    });

    const resolved = config as GiftConfig;
    const withTheme: GiftConfig = {
      ...resolved,
      theme: resolved.theme ?? resolved.colors,
      colors: resolved.colors ?? DEFAULT_CONFIG.colors,
    };

    // Embed scene elements if the template uses scene editor
    if (sceneElements.length > 0) {
      withTheme.scene = { elements: sceneElements, parallax: true };
    }

    return withTheme;
  }, [selectedTemplate, customValues, sceneElements]);

  const giftData: GiftData = useMemo(
    () => ({
      templateId: selectedTemplateId,
      config: currentConfig,
      message,
      senderName: senderName || undefined,
      recipientName: recipientName || undefined,
      images,
    }),
    [selectedTemplateId, currentConfig, message, senderName, recipientName, images],
  );

  const currentStep: StepKey = STEPS[stepIndex].key;

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "template":
        return !!selectedTemplateId;
      case "customize":
        return !!message.trim();
      case "preview":
      case "share":
        return true;
    }
  }, [currentStep, selectedTemplateId, message]);

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedTemplateId(id);
    const tpl = getTemplate(id);
    if (tpl) {
      const initial: Record<string, unknown> = {};
      tpl.customizableFields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          initial[f.key] = f.defaultValue;
        }
      });
      setCustomValues(initial);
    }
  }, []);

  const goNext = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((i) => i - 1);
    }
  }, [stepIndex]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      // Scene elements are already embedded in currentConfig via sceneElements state.
      // Fall back to mergeFlowerTreeScene only when no explicit scene exists.
      const configForSave =
        selectedTemplateId === "flower-tree" && !currentConfig.scene?.elements?.length
          ? mergeFlowerTreeScene(currentConfig, images)
          : currentConfig;

      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          config: configForSave,
          message,
          senderName: senderName || undefined,
          recipientName: recipientName || undefined,
          images: images
            .filter((image) => Boolean(image.assetId))
            .map((image) => ({
              assetId: image.assetId!,
              label: image.label || undefined,
              position: image.position,
            })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lưu quà tặng thất bại");
      }

      const data: GiftResponse = await res.json();
      setGiftResponse(data);
      setDirection(1);
      setStepIndex(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  }, [selectedTemplateId, currentConfig, message, senderName, recipientName, images]);

  const handleCustomFieldChange = useCallback((key: string, value: unknown) => {
    setCustomValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    templates,
    stepIndex,
    direction,
    saving,
    error,
    giftResponse,
    selectedTemplateId,
    selectedTemplate,
    message,
    senderName,
    recipientName,
    images,
    customValues,
    currentConfig,
    giftData,
    currentStep,
    canProceed,
    setMessage,
    setSenderName,
    setRecipientName,
    setImages,
    sceneElements,
    setSceneElements,
    handleSelectTemplate,
    handleCustomFieldChange,
    goNext,
    goBack,
    handleSave,
  };
}

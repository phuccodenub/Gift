"use client";

import { useRef, useCallback, useEffect, useMemo, useState } from "react";
import Moveable, {
  type OnDrag,
  type OnDragEnd,
  type OnResize,
  type OnResizeEnd,
  type OnRotate,
  type OnRotateEnd,
} from "react-moveable";
import { useEditorStore } from "./useEditorStore";
import SceneElementRenderer from "./SceneElementRenderer";
import SceneToolbar from "./SceneToolbar";
import type { GiftImageData, SceneElement } from "@/types/gift";

const CANVAS_W = 310;
const CANVAS_H = 360;

interface SceneEditorProps {
  images: GiftImageData[];
  defaultElements: SceneElement[];
  onChange: (elements: SceneElement[]) => void;
}

export default function SceneEditor({
  images,
  defaultElements,
  onChange,
}: SceneEditorProps) {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  const {
    elements,
    selectedId,
    setElements,
    selectElement,
    updateTransform,
    addElement,
    removeElement,
    duplicateElement,
    moveLayer,
    undo,
    redo,
    loadDraft,
    saveDraft,
    resetToDefault,
  } = useEditorStore();

  // Initialize elements (once)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const store = useEditorStore.getState();
    if (store.elements.length === 0) {
      // Try loading draft first
      loadDraft();
      const afterDraft = useEditorStore.getState();
      if (afterDraft.elements.length === 0 && defaultElements.length > 0) {
        setElements(defaultElements);
      }
    }
  }, [defaultElements, loadDraft, setElements]);

  // Push changes upstream
  useEffect(() => {
    onChange(elements);
  }, [elements, onChange]);

  // Autosave draft on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(), 500);
    return () => clearTimeout(timer);
  }, [elements, saveDraft]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          removeElement(selectedId);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedId, undo, redo, removeElement]);

  const imageByAssetId = useMemo(() => {
    const map = new Map<string, GiftImageData>();
    for (const img of images) {
      if (img.assetId) map.set(img.assetId, img);
    }
    return map;
  }, [images]);

  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId) ?? null,
    [elements, selectedId],
  );

  const moveableTarget = useMemo(() => {
    if (!selectedId || !containerEl) return null;
    return containerEl.querySelector(
      `[data-element-id="${CSS.escape(selectedId)}"]`,
    ) as HTMLElement | null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- elements triggers re-query after DOM update
  }, [selectedId, containerEl, elements]);

  // Track last known values from on* events (for use in on*End events)
  const lastDragTranslate = useRef<number[]>([0, 0]);
  const lastResizeData = useRef<{ width: number; height: number; translate: number[] }>({
    width: 0,
    height: 0,
    translate: [0, 0],
  });
  const lastRotation = useRef(0);

  const handleDrag = useCallback(
    (e: OnDrag) => {
      lastDragTranslate.current = e.translate;
      e.target.style.transform = `translate(${e.translate[0]}px, ${e.translate[1]}px) rotate(${(useEditorStore.getState().elements.find((el) => el.id === e.target.getAttribute("data-element-id"))?.transform.rotation ?? 0)}deg)`;
    },
    [],
  );

  const handleDragEnd = useCallback(
    (e: OnDragEnd) => {
      const id = (e.target as HTMLElement).getAttribute("data-element-id");
      if (!id) return;
      const el = useEditorStore.getState().elements.find((el) => el.id === id);
      if (!el) return;
      const [dx, dy] = lastDragTranslate.current;

      const x = Math.round(Math.max(0, Math.min(CANVAS_W - el.transform.width, el.transform.x + dx)));
      const y = Math.round(Math.max(0, Math.min(CANVAS_H - el.transform.height, el.transform.y + dy)));

      updateTransform(id, { ...el.transform, x, y });
      lastDragTranslate.current = [0, 0];
    },
    [updateTransform],
  );

  const handleResize = useCallback(
    (e: OnResize) => {
      lastResizeData.current = {
        width: e.width,
        height: e.height,
        translate: e.drag.translate,
      };
      e.target.style.width = `${e.width}px`;
      e.target.style.height = `${e.height}px`;
      e.target.style.transform = `translate(${e.drag.translate[0]}px, ${e.drag.translate[1]}px)`;
    },
    [],
  );

  const handleResizeEnd = useCallback(
    (e: OnResizeEnd) => {
      const id = (e.target as HTMLElement).getAttribute("data-element-id");
      if (!id) return;
      const el = useEditorStore.getState().elements.find((el) => el.id === id);
      if (!el) return;
      const { width, height, translate } = lastResizeData.current;

      updateTransform(id, {
        ...el.transform,
        x: Math.round(el.transform.x + translate[0]),
        y: Math.round(el.transform.y + translate[1]),
        width: Math.round(Math.max(20, width)),
        height: Math.round(Math.max(20, height)),
      });
      lastResizeData.current = { width: 0, height: 0, translate: [0, 0] };
    },
    [updateTransform],
  );

  const handleRotate = useCallback(
    (e: OnRotate) => {
      lastRotation.current = e.rotation;
      e.target.style.transform = `rotate(${e.rotation}deg)`;
    },
    [],
  );

  const handleRotateEnd = useCallback(
    (e: OnRotateEnd) => {
      const id = (e.target as HTMLElement).getAttribute("data-element-id");
      if (!id) return;
      const el = useEditorStore.getState().elements.find((el) => el.id === id);
      if (!el) return;

      updateTransform(id, {
        ...el.transform,
        rotation: Math.round(lastRotation.current % 360),
      });
      lastRotation.current = 0;
    },
    [updateTransform],
  );

  const handleAddText = useCallback(() => {
    const el: SceneElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Lời chúc",
      transform: { x: 80, y: 160, width: 150, height: 40, rotation: 0 },
      zIndex: elements.length + 1,
    };
    addElement(el);
    selectElement(el.id);
  }, [elements.length, addElement, selectElement]);

  const handleAddSticker = useCallback(
    (emoji: string) => {
      const el: SceneElement = {
        id: `sticker-${Date.now()}`,
        type: "sticker",
        content: emoji,
        transform: { x: 120, y: 120, width: 48, height: 48, rotation: 0 },
        zIndex: elements.length + 1,
      };
      addElement(el);
      selectElement(el.id);
    },
    [elements.length, addElement, selectElement],
  );

  const handleDeselect = useCallback(
    (e: React.PointerEvent) => {
      if (e.target === containerEl) {
        selectElement(null);
      }
    },
    [selectElement, containerEl],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--app-text)]">
          Bố cục ảnh & trang trí
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={undo}
            className="min-h-8 min-w-8 rounded p-1.5 text-xs text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.12)]"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={redo}
            className="min-h-8 min-w-8 rounded p-1.5 text-xs text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.12)]"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            ↪
          </button>
          <button
            type="button"
            onClick={() => resetToDefault(defaultElements)}
            className="min-h-8 min-w-8 rounded p-1.5 text-xs text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.12)]"
            title="Reset"
            aria-label="Reset"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={setContainerEl}
        className="relative mx-auto overflow-hidden rounded-2xl border border-white/20"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          background:
            "radial-gradient(circle at 24% 12%, rgba(216,184,130,0.25), transparent 40%), linear-gradient(145deg, #21141e, #3f1e35 58%, #251821)",
        }}
        onPointerDown={handleDeselect}
      >
        {elements.map((el) => (
          <SceneElementRenderer
            key={el.id}
            element={el}
            images={imageByAssetId}
            selected={el.id === selectedId}
            onSelect={() => selectElement(el.id)}
          />
        ))}

        {moveableTarget && selectedId && (
          <Moveable
            target={moveableTarget}
            container={containerEl ?? undefined}
            draggable
            resizable
            rotatable
            snappable
            bounds={{ left: 0, top: 0, right: CANVAS_W, bottom: CANVAS_H }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
            onRotate={handleRotate}
            onRotateEnd={handleRotateEnd}
            throttleDrag={1}
            throttleResize={1}
            throttleRotate={1}
            renderDirections={["nw", "ne", "sw", "se"]}
            edge={false}
          />
        )}
      </div>

      {/* Element toolbar */}
      <SceneToolbar
        selectedElement={selectedElement}
        onAddText={handleAddText}
        onAddSticker={handleAddSticker}
        onDuplicate={selectedId ? () => duplicateElement(selectedId) : undefined}
        onDelete={selectedId ? () => removeElement(selectedId) : undefined}
        onMoveUp={selectedId ? () => moveLayer(selectedId, "up") : undefined}
        onMoveDown={selectedId ? () => moveLayer(selectedId, "down") : undefined}
      />
    </div>
  );
}

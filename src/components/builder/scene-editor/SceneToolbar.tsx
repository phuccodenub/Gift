"use client";

import type { SceneElement } from "@/types/gift";

const STICKER_OPTIONS = ["✦", "✿", "❋", "♥", "◆", "✧"];

interface SceneToolbarProps {
  selectedElement: SceneElement | null;
  onAddText: () => void;
  onAddSticker: (emoji: string) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function SceneToolbar({
  selectedElement,
  onAddText,
  onAddSticker,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SceneToolbarProps) {
  return (
    <div className="space-y-2">
      {/* Add controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAddText}
          className="min-h-11 rounded-lg border border-[rgba(96,61,77,0.2)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[var(--app-text)] hover:bg-white"
        >
          + Văn bản
        </button>
        <div className="flex gap-1">
          {STICKER_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onAddSticker(emoji)}
              className="min-h-11 min-w-11 rounded-lg border border-[rgba(96,61,77,0.2)] bg-white/80 p-1.5 text-base hover:bg-white"
              title={`Thêm ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Selected element actions */}
      {selectedElement && (
        <div className="flex items-center gap-2 rounded-lg border border-[rgba(96,61,77,0.18)] bg-white/75 px-3 py-2">
          <span className="text-xs text-[var(--app-text-soft)]">
            {selectedElement.type === "image" ? "Ảnh" : selectedElement.type === "text" ? "Văn bản" : "Sticker"}
            {" "}— {selectedElement.id}
          </span>
          <div className="ml-auto flex gap-1">
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="min-h-8 min-w-8 rounded p-1 text-xs text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.12)]"
                title="Chuyển xuống lớp dưới"
              >
                ▼
              </button>
            )}
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="min-h-8 min-w-8 rounded p-1 text-xs text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.12)]"
                title="Chuyển lên lớp trên"
              >
                ▲
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                onClick={onDuplicate}
                className="min-h-8 min-w-8 rounded p-1 text-xs text-[var(--app-brand)] hover:bg-[rgba(180,44,95,0.12)]"
                title="Nhân bản"
              >
                ❐
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="min-h-8 min-w-8 rounded p-1 text-xs text-red-500 hover:bg-red-100"
                title="Xóa"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

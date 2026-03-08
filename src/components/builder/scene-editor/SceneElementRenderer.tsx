"use client";

import type { SceneElement } from "@/types/gift";
import type { GiftImageData } from "@/types/gift";

interface SceneElementRendererProps {
  element: SceneElement;
  images: Map<string, GiftImageData>;
  selected: boolean;
  onSelect: () => void;
}

export default function SceneElementRenderer({
  element,
  images,
  selected,
  onSelect,
}: SceneElementRendererProps) {
  const { transform, type, content, assetRef, style } = element;

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: transform.x,
    top: transform.y,
    width: transform.width,
    height: transform.height,
    transform: `rotate(${transform.rotation ?? 0}deg)`,
    zIndex: element.zIndex,
    cursor: "pointer",
    outline: selected ? "2px solid #d8b882" : "2px solid transparent",
    outlineOffset: 2,
    boxSizing: "border-box",
  };

  if (type === "image") {
    const image = assetRef ? images.get(assetRef) : undefined;
    const src = image?.publicUrl || image?.url;
    const shape = style?.shape === "rounded" ? 16 : 999;

    return (
      <div style={containerStyle} onPointerDown={onSelect} data-element-id={element.id}>
        {src ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: shape,
              overflow: "hidden",
              border: "2px solid rgba(232, 207, 171, 0.72)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={content || ""}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: shape,
              background: "rgba(255,255,255,0.08)",
              border: "2px dashed rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
            }}
          >
            No image
          </div>
        )}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div style={containerStyle} onPointerDown={onSelect} data-element-id={element.id}>
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "8px 12px",
            color: "#fef7f2",
            fontSize: 13,
            borderRadius: 12,
            background: "rgba(143, 28, 72, 0.2)",
            border: "1px solid rgba(232, 207, 171, 0.45)",
            backdropFilter: "blur(4px)",
            overflow: "hidden",
          }}
        >
          {content || "Text"}
        </div>
      </div>
    );
  }

  if (type === "sticker") {
    return (
      <div style={containerStyle} onPointerDown={onSelect} data-element-id={element.id}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.min(transform.width, transform.height) * 0.6,
          }}
        >
          {content || "⭐"}
        </div>
      </div>
    );
  }

  // shape fallback
  return (
    <div style={containerStyle} onPointerDown={onSelect} data-element-id={element.id}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 8,
          background: String(style?.fill ?? "rgba(255,255,255,0.15)"),
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      />
    </div>
  );
}

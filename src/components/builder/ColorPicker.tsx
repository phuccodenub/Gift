"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  { hex: "#8f1c48", name: "Rosewood" },
  { hex: "#b42c5f", name: "Berry" },
  { hex: "#d88aa1", name: "Blush" },
  { hex: "#e7b3c1", name: "Rose dust" },
  { hex: "#d8b882", name: "Champagne" },
  { hex: "#e8cfab", name: "Light gold" },
  { hex: "#231723", name: "Noir" },
  { hex: "#3e2a3b", name: "Noir soft" },
  { hex: "#5f4358", name: "Slate plum" },
  { hex: "#ffffff", name: "White" },
  { hex: "#fff6f3", name: "Ivory" },
  { hex: "#f5eceb", name: "Porcelain" },
];

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const isPreset = PRESET_COLORS.some((c) => c.hex === value.toLowerCase());

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--app-text)]">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => {
          const selected = value.toLowerCase() === color.hex;
          const isWhitish = ["#ffffff", "#fdf2f8", "#faf5ff"].includes(color.hex);

          return (
            <motion.button
              key={color.hex}
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => onChange(color.hex)}
              title={color.name}
              className={cn(
                "h-8 w-8 cursor-pointer rounded-full transition-shadow duration-200",
                isWhitish && "border border-[rgba(96,61,77,0.2)]",
                selected
                  ? "ring-2 ring-[rgba(143,28,72,0.5)] ring-offset-2 ring-offset-[var(--app-bg)] shadow-md"
                  : "hover:shadow-md",
              )}
              style={{ backgroundColor: color.hex }}
            />
          );
        })}

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
          onClick={() => setShowCustom((v) => !v)}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed transition-colors",
            !isPreset && !showCustom
              ? "border-[var(--app-brand)] text-[var(--app-brand)] ring-2 ring-[rgba(143,28,72,0.45)] ring-offset-2 ring-offset-[var(--app-bg)]"
              : "border-[rgba(96,61,77,0.35)] text-[var(--app-text-soft)]",
          )}
          title="Màu tùy chỉnh"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.button>
      </div>

      {showCustom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-3 pt-1"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-[rgba(96,61,77,0.2)]"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ff69b4"
            className="flex-1 rounded-lg border border-[rgba(96,61,77,0.2)] bg-white px-3 py-2 font-mono text-sm text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.25)]"
          />
        </motion.div>
      )}
    </div>
  );
}

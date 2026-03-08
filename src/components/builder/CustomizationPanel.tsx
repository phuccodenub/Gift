"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CustomField } from "@/types/gift";
import ColorPicker from "./ColorPicker";

interface CustomizationPanelProps {
  fields: CustomField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: CustomField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full appearance-none rounded-[14px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-2.5 text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.24)] cursor-pointer"
    >
      {field.options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function RangeField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-[rgba(143,28,72,0.16)] accent-[var(--app-brand)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--app-brand)]"
      />
      <span className="w-10 text-right text-sm font-medium tabular-nums text-[var(--app-text-soft)]">
        {value}
      </span>
    </div>
  );
}

function ToggleField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-7 w-12 cursor-pointer rounded-full transition-colors duration-300",
        value
          ? "bg-[linear-gradient(125deg,#8f1c48,#b42c5f)]"
          : "bg-[rgba(96,61,77,0.22)]",
      )}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function TextField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full rounded-[14px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-2.5 text-[var(--app-text)] placeholder:text-[rgba(95,67,88,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.24)]"
    />
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function CustomizationPanel({
  fields,
  values,
  onChange,
}: CustomizationPanelProps) {
  if (fields.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <h3 className="text-2xl font-semibold text-[var(--app-text)]">
        Tùy chỉnh
      </h3>

      <div className="space-y-4">
        {fields.map((field) => {
          const val = values[field.key] ?? field.defaultValue ?? "";

          return (
            <motion.div key={field.key} variants={itemVariants} className="space-y-1.5">
              {field.type === "color" ? (
                <ColorPicker
                  label={field.label}
                  value={String(val)}
                  onChange={(color) => onChange(field.key, color)}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[var(--app-text)]">
                      {field.label}
                    </label>
                    {field.type === "toggle" && (
                      <ToggleField
                        value={Boolean(val)}
                        onChange={(v) => onChange(field.key, v)}
                      />
                    )}
                  </div>

                  {field.type === "select" && (
                    <SelectField
                      field={field}
                      value={String(val)}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  )}

                  {field.type === "text" && (
                    <TextField
                      value={String(val)}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  )}

                  {field.type === "range" && (
                    <RangeField
                      value={Number(val)}
                      onChange={(v) => onChange(field.key, v)}
                    />
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const STEPS = [
  { key: "template", label: "Chọn mẫu" },
  { key: "customize", label: "Tùy chỉnh" },
  { key: "preview", label: "Xem trước" },
  { key: "share", label: "Chia sẻ" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export default function StepIndicator({
  currentIndex,
}: {
  currentIndex: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  y: isActive ? -1 : 0,
                  backgroundColor: isActive
                    ? "rgb(143 28 72)"
                    : isCompleted
                      ? "rgb(180 44 95)"
                      : "rgba(255,250,248,0.94)",
                }}
                className="flex size-8 items-center justify-center rounded-full border border-[rgba(96,61,77,0.2)] text-xs font-bold transition-colors sm:size-9 sm:text-sm"
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <span className={isActive ? "text-white" : "text-[var(--app-text-soft)]"}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span
                className={cn(
                  "hidden text-xs font-semibold sm:block",
                  isActive
                    ? "text-[var(--app-brand)]"
                    : isCompleted
                      ? "text-[var(--app-brand-strong)]"
                      : "text-[var(--app-text-soft)]",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-6 rounded-full sm:w-10",
                  i < currentIndex ? "bg-[var(--app-brand-strong)]" : "bg-[rgba(96,61,77,0.2)]",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

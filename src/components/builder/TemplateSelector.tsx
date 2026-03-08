"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GiftTemplate } from "@/types/gift";

interface TemplateSelectorProps {
  templates: GiftTemplate[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  }),
};

export default function TemplateSelector({
  templates,
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-[var(--app-text)]">
        Chọn template quà tặng
      </h3>
      <p className="text-sm text-[var(--app-text-soft)]">
        Mỗi template có phong cách cảnh quan và motion riêng. Chọn mẫu phù hợp nhất với người nhận.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {templates.map((tpl, i) => {
          const selected = tpl.id === selectedId;

          return (
            <motion.button
              key={tpl.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(tpl.id)}
              className={cn(
                "group relative flex min-h-11 flex-col overflow-hidden rounded-[20px] border transition-shadow duration-300 cursor-pointer text-left",
                selected
                  ? "border-[var(--app-brand)] shadow-[0_24px_48px_-32px_rgba(66,20,44,0.78)] ring-2 ring-[rgba(143,28,72,0.24)]"
                  : "border-[rgba(96,61,77,0.18)] bg-white/75 hover:border-[rgba(143,28,72,0.38)] hover:shadow-[0_20px_40px_-32px_rgba(66,20,44,0.7)]",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(circle_at_20%_16%,rgba(216,184,130,0.2),transparent_45%),linear-gradient(160deg,#fff9f7,#f7ebe9)]">
                <Image
                  src={tpl.thumbnail}
                  alt={tpl.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-[var(--app-brand)] text-white shadow-md"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </motion.div>
                )}
              </div>

              <div className="bg-white/82 p-3">
                <p className="truncate text-sm font-semibold text-[var(--app-text)]">
                  {tpl.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--app-text-soft)]">
                  {tpl.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { type ComponentType } from "react";
import { motion } from "framer-motion";
import type { GiftData, GiftViewerProps } from "@/types/gift";

interface LivePreviewProps {
  gift: GiftData;
  TemplateComponent: ComponentType<GiftViewerProps>;
}

export default function LivePreview({ gift, TemplateComponent }: LivePreviewProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-[var(--app-text)]">
        Xem truoc
      </h3>

      <div className="flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <div className="relative h-[640px] w-[320px] overflow-hidden rounded-[2.35rem] border border-[rgba(86,57,76,0.3)] bg-[linear-gradient(155deg,#261720,#4f2842)] shadow-[0_24px_60px_-30px_rgba(38,17,31,0.92)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
            <div className="absolute left-1/2 top-1.5 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[rgba(18,8,15,0.86)]" />
            <div className="h-full overflow-y-auto bg-white">
              <TemplateComponent gift={gift} isPreview />
            </div>
            <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-[rgba(255,255,255,0.45)]" />
          </div>
          <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_30%_14%,rgba(216,184,130,0.35),transparent_45%),radial-gradient(circle_at_78%_80%,rgba(180,44,95,0.25),transparent_52%)] blur-xl" />
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTemplate } from "@/components/templates/registry";
import type { GiftData } from "@/types/gift";
import { GiftExperienceShell } from "@/components/viewer/GiftExperienceShell";
import { SharePanel } from "@/components/viewer/SharePanel";

interface GiftViewerProps {
  gift: GiftData;
}

function getOrCreateViewerId(): string {
  const key = "giftcraft.viewer_id";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(key, nextId);
  return nextId;
}

export function GiftViewer({ gift }: GiftViewerProps) {
  const [showShare, setShowShare] = useState(false);
  const template = getTemplate(gift.templateId);

  useEffect(() => {
    if (!gift.id) return;

    const viewerId = getOrCreateViewerId();
    const sessionMarker = `giftcraft.view.sent:${gift.id}:${viewerId}`;
    if (window.sessionStorage.getItem(sessionMarker) === "1") {
      return;
    }
    window.sessionStorage.setItem(sessionMarker, "1");

    const endpoint = `/api/gifts/${gift.id}/view`;
    const payload = JSON.stringify({ viewerId });

    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [gift.id]);

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pink-50">
        <p className="text-lg text-rose-600">Template không tồn tại.</p>
      </div>
    );
  }

  const TemplateComponent = template.renderWeb;

  return (
    <div className="relative">
      <GiftExperienceShell gift={gift}>
        <TemplateComponent gift={gift} />
      </GiftExperienceShell>

      <motion.button
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowShare(true)}
        title="Chia sẻ"
        aria-label="Chia sẻ quà tặng"
      >
        <svg
          className="h-5 w-5 text-rose-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186z"
          />
        </svg>
      </motion.button>

      <AnimatePresence>
        {showShare && (
          <SharePanel
            giftId={gift.id!}
            giftSlug={gift.slug}
            recipientName={gift.recipientName}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

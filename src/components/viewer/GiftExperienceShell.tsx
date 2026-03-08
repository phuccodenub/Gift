"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildFallingRuntimeItems,
  getGiftAudioConfig,
  hasClickHeartBurst,
} from "@/lib/gift-effects";
import type { GiftData } from "@/types/gift";

type HeartBurst = {
  id: number;
  x: number;
  y: number;
};

function FallingMessageCard({
  text,
  left,
  delay,
  duration,
  sway,
  rotation,
  width,
}: {
  text: string;
  left: number;
  delay: number;
  duration: number;
  sway: number;
  rotation: number;
  width: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 z-30"
      style={{ left: `${left}%`, width, transform: `translateX(-50%) rotate(${rotation}deg)` }}
      initial={{ y: -180, opacity: 0 }}
      animate={{
        y: ["-18vh", "118vh"],
        x: [0, sway, -sway * 0.6, sway * 0.3],
        opacity: [0, 0.95, 0.95, 0],
        rotate: [rotation, rotation + 6, rotation - 5, rotation + 2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="rounded-[22px] border border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,244,248,0.88))] px-4 py-3 text-center shadow-[0_18px_36px_-22px_rgba(86,33,59,0.7)] backdrop-blur-md">
        <p
          className="text-sm font-semibold leading-relaxed text-[rgba(102,30,66,0.92)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

function FallingPhotoCard({
  src,
  alt,
  left,
  delay,
  duration,
  sway,
  rotation,
  size,
}: {
  src: string;
  alt?: string;
  left: number;
  delay: number;
  duration: number;
  sway: number;
  rotation: number;
  size: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 z-20"
      style={{ left: `${left}%`, width: size, transform: `translateX(-50%) rotate(${rotation}deg)` }}
      initial={{ y: -220, opacity: 0 }}
      animate={{
        y: ["-20vh", "118vh"],
        x: [0, -sway * 0.4, sway, -sway * 0.2],
        opacity: [0, 0.95, 0.95, 0],
        rotate: [rotation, rotation - 8, rotation + 7, rotation - 3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,249,0.95))] p-2 shadow-[0_20px_42px_-24px_rgba(50,22,40,0.8)]">
        <div className="overflow-hidden rounded-[18px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ""}
            className="h-auto w-full object-cover"
            style={{ aspectRatio: "1 / 1" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function HeartBurstFx({ x, y }: { x: number; y: number }) {
  return (
    <div className="pointer-events-none absolute z-40" style={{ left: x, top: y }}>
      {Array.from({ length: 9 }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / 9;
        const distance = 20 + (index % 3) * 10;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        return (
          <motion.span
            key={index}
            className="absolute left-0 top-0 text-sm"
            style={{
              color: index % 2 === 0 ? "#fb7185" : "#f472b6",
              textShadow: "0 0 10px rgba(244,114,182,0.4)",
            }}
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.2, x: dx, y: dy }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            ♥
          </motion.span>
        );
      })}
    </div>
  );
}

interface GiftExperienceShellProps {
  gift: GiftData;
  children: ReactNode;
}

export function GiftExperienceShell({
  gift,
  children,
}: GiftExperienceShellProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioButtonRef = useRef<HTMLButtonElement | null>(null);
  const burstIdRef = useRef(0);
  const startedAudioUrlRef = useRef<string | null>(null);
  const userPausedAudioUrlRef = useRef<string | null>(null);
  const [heartBursts, setHeartBursts] = useState<HeartBurst[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const fallingItems = useMemo(() => buildFallingRuntimeItems(gift), [gift]);
  const audio = useMemo(() => getGiftAudioConfig(gift), [gift]);
  const audioUrl = audio?.publicUrl ?? "";

  const startAudioIfAllowed = async () => {
    if (
      !audioRef.current ||
      !audioUrl ||
      startedAudioUrlRef.current === audioUrl ||
      userPausedAudioUrlRef.current === audioUrl
    ) {
      return;
    }

    try {
      await audioRef.current.play();
      setIsAudioPlaying(true);
      startedAudioUrlRef.current = audioUrl;
    } catch {
      return;
    }
  };

  const handlePointerDownCapture = async (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const targetNode = event.target as Node | null;
    if (audioButtonRef.current && targetNode && audioButtonRef.current.contains(targetNode)) {
      return;
    }

    if (containerRef.current && hasClickHeartBurst(gift)) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nextId = burstIdRef.current + 1;
      burstIdRef.current = nextId;

      setHeartBursts((current) => [...current, { id: nextId, x, y }]);
      window.setTimeout(() => {
        setHeartBursts((current) => current.filter((burst) => burst.id !== nextId));
      }, 850);
    }

    await startAudioIfAllowed();
  };

  const toggleAudio = async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (audioEl.paused) {
      userPausedAudioUrlRef.current = null;
      try {
        await audioEl.play();
        startedAudioUrlRef.current = audioUrl || startedAudioUrlRef.current;
      } catch {
        return;
      }
    } else {
      userPausedAudioUrlRef.current = audioUrl || userPausedAudioUrlRef.current;
      audioEl.pause();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerDownCapture={handlePointerDownCapture}
    >
      {children}

      {audio && (
        <audio
          key={audio.publicUrl}
          ref={audioRef}
          src={audio.publicUrl}
          preload="metadata"
          loop
          onPlay={() => setIsAudioPlaying(true)}
          onPause={() => setIsAudioPlaying(false)}
          onLoadStart={() => setIsAudioPlaying(false)}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {fallingItems.map((item) =>
          item.kind === "message" ? (
            <FallingMessageCard key={item.id} {...item} />
          ) : (
            <FallingPhotoCard key={item.id} {...item} />
          ),
        )}

        <AnimatePresence>
          {heartBursts.map((burst) => (
            <HeartBurstFx key={burst.id} x={burst.x} y={burst.y} />
          ))}
        </AnimatePresence>
      </div>

      {audio && (
        <div className="pointer-events-none absolute inset-0 z-40">
          <button
            ref={audioButtonRef}
            type="button"
            onClick={toggleAudio}
            className="pointer-events-auto absolute bottom-4 right-4 flex min-h-11 min-w-11 items-center gap-2 rounded-full border border-white/55 bg-[rgba(255,252,250,0.88)] px-4 py-2 text-sm font-semibold text-[rgba(99,28,65,0.9)] shadow-[0_18px_42px_-24px_rgba(60,21,45,0.8)] backdrop-blur-md transition-transform hover:scale-[1.03]"
            aria-label={isAudioPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}
          >
            <span>{isAudioPlaying ? "❚❚" : "▶"}</span>
            <span>{isAudioPlaying ? "Tạm dừng" : "Phát nhạc"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftViewerProps } from "@/types/gift";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import { shouldUseLegacyImageLayout } from "@/lib/gift-effects";

/* ── Floating hearts ── */
function FloatingHeart({ x, delay, size, color, dur }: { x: number; delay: number; size: number; color: string; dur: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0"
      style={{ left: `${x}%`, fontSize: size }}
      animate={{ y: [0, -500, -900], x: [0, Math.sin(x) * 30, Math.sin(x) * -20], opacity: [0, 0.7, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeOut" }}
    >
      <span style={{ color, filter: `drop-shadow(0 0 4px ${color}66)` }}>♥</span>
    </motion.div>
  );
}

/* ── Sparkle ── */
function Sparkle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: "radial-gradient(circle, #fff, #fff8, transparent)", borderRadius: "50%" }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
      transition={{ duration: 2, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ── Confetti burst when card opens ── */
function ConfettiBurst({ colors: c, seed }: { colors: string[]; seed: string }) {
  const pieces = useMemo(() => {
    const random = createDeterministicRandom(`${seed}:confetti-burst`);
    return Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 18) * 360;
      const rad = (angle * Math.PI) / 180;
      const dist = 120 + randomInRange(random, 0, 80);
      const size = 6 + randomInRange(random, 0, 6);
      return {
        id: i,
        dist,
        size,
        angle,
        rad,
        color: c[i % c.length],
      };
    });
  }, [c, seed]);

  return (
    <>
      {pieces.map((piece) => {
        return (
          <motion.div
            key={piece.id}
            className="absolute left-1/2 top-1/2"
            style={{ width: piece.size, height: piece.size * 1.5, background: piece.color, borderRadius: 2 }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(piece.rad) * piece.dist, y: Math.sin(piece.rad) * piece.dist, opacity: 0, rotate: piece.angle + 180 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
}

export function GreetingCardGift({ gift, isPreview }: GiftViewerProps) {
  const [isOpen, setIsOpen] = useState(isPreview ?? false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { colors } = gift.config;
  const showLegacyImages = shouldUseLegacyImageLayout(gift);

  const ambient = useMemo(() => {
    const random = createDeterministicRandom(`greeting:${gift.id ?? gift.templateId}:ambient`);
    const hearts = Array.from({ length: 8 }).map((_, i) => ({
      id: `h-${i}`, x: randomInRange(random, 5, 95), delay: randomInRange(random, 0, 6),
      size: randomInRange(random, 14, 24), color: [colors.primary, colors.secondary, colors.accent || colors.primary][i % 3],
      dur: randomInRange(random, 6, 10),
    }));
    const sparkles = Array.from({ length: 12 }).map((_, i) => ({
      id: `sp-${i}`, x: randomInRange(random, 5, 95), y: randomInRange(random, 5, 95),
      delay: randomInRange(random, 0, 4), size: randomInRange(random, 3, 7),
    }));
    return { hearts, sparkles };
  }, [gift.id, gift.templateId, colors]);

  const handleToggle = () => {
    if (!isOpen) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${colors.primary}18, transparent 50%), radial-gradient(circle at 18% 12%, ${colors.secondary}20, transparent 36%), radial-gradient(circle at 82% 16%, ${colors.accent || colors.primary}16, transparent 34%), linear-gradient(155deg, ${colors.background || "#fdf2f8"}, #f9e8f0, #fdf2f8)`,
      }}
    >
      {/* floating hearts */}
      {ambient.hearts.map((h) => <FloatingHeart key={h.id} x={h.x} delay={h.delay} size={h.size} color={h.color} dur={h.dur} />)}

      {/* sparkles */}
      {ambient.sparkles.map((s) => <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} size={s.size} />)}

      {/* soft bokeh */}
      <div className="pointer-events-none absolute left-[10%] top-[20%] size-80 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${colors.primary}88, transparent)`, filter: "blur(60px)" }} />
      <div className="pointer-events-none absolute bottom-[15%] right-[8%] size-60 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${colors.secondary}88, transparent)`, filter: "blur(50px)" }} />

      <div className="relative" style={{ perspective: 1200 }}>
        {/* confetti burst on open */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-50"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ConfettiBurst
                seed={gift.id ?? gift.templateId}
                colors={[colors.primary, colors.secondary, colors.accent || "#fde68a", "#f472b6", "#a78bfa"]}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative cursor-pointer"
          style={{ width: 320, height: 440, transformStyle: "preserve-3d" }}
          onClick={handleToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* ── Inside of card ── */}
          <div
            className="absolute inset-0 overflow-hidden rounded-[28px] p-[2px]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {/* decorative gradient border */}
            <div className="absolute inset-0 rounded-[28px]" style={{ background: `linear-gradient(135deg, ${colors.primary}44, ${colors.secondary}44, ${colors.primary}44)` }} />
            <div
              className="relative flex h-full flex-col justify-between rounded-[26px] p-8"
              style={{
                background: "linear-gradient(180deg, #fffbf7, #fef7ed)",
                boxShadow: `inset 0 2px 0 rgba(255,255,255,0.8), 0 30px 62px -38px rgba(51,19,37,0.7)`,
              }}
            >
              {/* decorative top flourish */}
              <div className="mb-3 flex justify-center text-2xl opacity-40" style={{ color: colors.primary }}>✿ ── ✿ ── ✿</div>

              <div className="flex-1">
                {(gift.config.letterHeading || gift.recipientName) && (
                  <motion.p
                    className="mb-3 text-base font-medium italic"
                    style={{ color: colors.primary, fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOpen ? 1 : 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {gift.config.letterHeading || `Gửi ${gift.recipientName} thương mến,`}
                  </motion.p>
                )}
                <motion.p
                  className="whitespace-pre-wrap leading-[1.85]"
                  style={{ fontFamily: "var(--font-display)", color: "#2f1a2a", fontSize: 17 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {gift.message}
                </motion.p>
              </div>
              {(gift.config.letterSignature || gift.senderName) && (
                <motion.p
                  className="mt-4 text-right text-base font-medium italic"
                  style={{ color: colors.primary }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {gift.config.letterSignature || `Yêu thương, ${gift.senderName} 💕`}
                </motion.p>
              )}

              {/* decorative bottom flourish */}
              <div className="mt-3 flex justify-center text-2xl opacity-40" style={{ color: colors.primary }}>✿ ── ✿ ── ✿</div>
            </div>
          </div>

          {/* ── Front cover ── */}
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-[28px]"
            style={{
              background: `linear-gradient(132deg, ${colors.primary}, ${colors.secondary})`,
              backfaceVisibility: "hidden",
              transformOrigin: "left center",
              boxShadow: `0 30px 58px -20px rgba(43,16,31,0.6)`,
            }}
            animate={{ rotateY: isOpen ? -180 : 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* embossed diamond pattern overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)`,
            }} />

            {/* soft inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ background: "radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.12), transparent 60%)" }} />

            <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-white">
              {/* decorative circle with icon */}
              <motion.div
                className="relative flex size-24 items-center justify-center rounded-full"
                style={{ border: "2px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", boxShadow: "0 0 30px rgba(255,255,255,0.08)" }}
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                <span className="text-5xl">🌸</span>
                {/* orbiting sparkle */}
                <motion.div
                  className="absolute size-2 rounded-full bg-white"
                  style={{ boxShadow: "0 0 6px rgba(255,255,255,0.6)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  initial={{ x: 44 }}
                />
              </motion.div>

              <div className="flex flex-col items-center gap-2">
                <h2
                  className="text-center text-2xl font-bold tracking-wide"
                  style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                >
                  Thiệp 8/3
                </h2>
                <div className="h-px w-16 rounded" style={{ background: "rgba(255,255,255,0.3)" }} />
              </div>

              <motion.p
                className="text-sm font-light opacity-80"
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ Chạm để mở thiệp ✨
              </motion.p>

              {showLegacyImages && gift.images.length > 0 && (
                <motion.div
                  className="mt-2 flex gap-2 rounded-full px-4 py-2"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {gift.images.slice(0, 3).map((img, i) => (
                    <div
                      key={i}
                      className="size-12 overflow-hidden rounded-full"
                      style={{ border: "2px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.publicUrl || img.url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* decorative bottom hearts */}
              <div className="mt-4 flex gap-3 text-sm opacity-40">
                <span>♥</span><span>♥</span><span>♥</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.p
              className="mt-5 text-center text-sm font-medium"
              style={{ color: colors.primary }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              Chạm lại để đóng thiệp
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftViewerProps } from "@/types/gift";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import { shouldUseLegacyImageLayout } from "@/lib/gift-effects";
import {
  BOUQUET_LAYOUT,
  BOUQUET_PETAL_ANGLES,
  getBouquetCalyxHeight,
  getBouquetCalyxWidth,
  getBouquetHeadTop,
  getBouquetInnerPetalHeight,
  getBouquetInnerPetalWidth,
  getBouquetLeafHeight,
  getBouquetLeafWidth,
  getBouquetOuterPetalHeight,
  getBouquetOuterPetalWidth,
  getBouquetStemSpecs,
  getBouquetStemWidth,
} from "./scene";

type Stage = "opening" | "bouquet" | "message";

/* ── ambient particles ── */
function Firefly({ x, y, delay, size, dur }: { x: number; y: number; delay: number; size: number; dur: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: "radial-gradient(circle, #ffe4b5, transparent)", filter: "blur(1px)" }}
      animate={{ opacity: [0, 0.9, 0], y: [0, -40, -80], x: [0, 10, -5] }}
      transition={{ duration: dur, delay, repeat: Infinity, repeatDelay: dur * 0.3, ease: "easeInOut" }}
    />
  );
}

function HeartParticle({ x, delay, dur, color }: { x: number; delay: number; dur: number; color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-0"
      style={{ left: `${x}%`, color, fontSize: 14, filter: "blur(0.3px)" }}
      animate={{ y: [0, "-100vh"], opacity: [0, 0.7, 0], rotate: [0, 30, -20, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
    >
      ♥
    </motion.div>
  );
}

function FallingPetal({ color, delay, left, dur }: { color: string; delay: number; left: number; dur: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0"
      style={{ left: `${left}%` }}
      initial={{ y: -20, rotate: 0, opacity: 0 }}
      animate={{ y: "110vh", rotate: 720, opacity: [0, 0.6, 0.4, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <ellipse cx="8" cy="10" rx="6" ry="10" fill={color} opacity="0.7" />
        <ellipse cx="8" cy="8" rx="3" ry="5" fill={`${color}44`} />
      </svg>
    </motion.div>
  );
}

/* ── mountain silhouette for atmosphere ── */
function MountainBg({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0" style={{ height: "35%" }}>
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute bottom-0 h-full w-full">
        <path d="M0,224L80,208C160,192,320,160,480,170.7C640,181,800,235,960,234.7C1120,235,1280,181,1360,154.7L1440,128L1440,320L0,320Z" fill={`${color}18`} />
        <path d="M0,256L60,250.7C120,245,240,235,360,234.7C480,235,600,245,720,240C840,235,960,213,1080,213.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L0,320Z" fill={`${color}28`} />
        <path d="M0,288L120,277.3C240,267,480,245,720,256C960,267,1200,309,1320,320L1440,320L1440,320L0,320Z" fill={`${color}38`} />
      </svg>
    </div>
  );
}

/* ── flower head (CSS petals) ── */
function FlowerHead({ size, color }: { size: number; color: string }) {
  const outerPetalW = getBouquetOuterPetalWidth(size);
  const outerPetalH = getBouquetOuterPetalHeight(size);
  const innerPetalW = getBouquetInnerPetalWidth(size);
  const innerPetalH = getBouquetInnerPetalHeight(size);
  const calyxWidth = getBouquetCalyxWidth(size);
  const calyxHeight = getBouquetCalyxHeight(size);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute left-1/2 z-10 -translate-x-1/2 rounded-[50%_50%_42%_42%/74%_74%_30%_30%]"
        style={{
          bottom: size * 0.18,
          width: calyxWidth,
          height: calyxHeight,
          background: "linear-gradient(180deg, #16a34a, #22c55e)",
          boxShadow: "0 0 8px rgba(34,197,94,0.28)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 rounded-full"
        style={{
          width: size * 0.74,
          height: size * 0.74,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${color}2f, transparent 72%)`,
          filter: "blur(10px)",
        }}
      />
      {BOUQUET_PETAL_ANGLES.map((deg, i) => (
        <div
          key={`outer-${i}`}
          className="absolute left-1/2 top-1/2 z-20 rounded-[55%_55%_44%_44%/72%_72%_34%_34%]"
          style={{
            width: outerPetalW,
            height: outerPetalH,
            background: `radial-gradient(ellipse at 50% 28%, ${color}, ${color}d1 60%, ${color}a6)`,
            transformOrigin: "50% 100%",
            transform: `translate(-50%, -96%) rotate(${deg}deg)`,
            boxShadow: `inset 0 -7px 12px ${color}66, 0 0 10px ${color}40`,
          }}
        />
      ))}
      {BOUQUET_PETAL_ANGLES.map((deg, i) => (
        <div
          key={`inner-${i}`}
          className="absolute left-1/2 top-1/2 z-30 rounded-[60%_60%_45%_45%/70%_70%_36%_36%]"
          style={{
            width: innerPetalW,
            height: innerPetalH,
            background: "radial-gradient(ellipse at 50% 32%, rgba(255,255,255,0.72), rgba(255,255,255,0.16))",
            opacity: 0.55,
            transformOrigin: "50% 100%",
            transform: `translate(-50%, -90%) rotate(${deg + 30}deg)`,
          }}
        />
      ))}
      <div
        className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size * 0.22,
          height: size * 0.22,
          background: "radial-gradient(circle, #fff4b2 0%, #fde68a 44%, #f59e0b 100%)",
          boxShadow: "0 0 14px #f59e0b88",
        }}
      />
    </div>
  );
}

/* ── bouquet unit: stem + flower head + leaf as one connected unit ── */
function BouquetUnit({
  angle,
  xOffset,
  stemH,
  headSize,
  color,
  delay,
  zIndex,
  leafSide,
}: {
  angle: number;
  xOffset: number;
  stemH: number;
  headSize: number;
  color: string;
  delay: number;
  zIndex: number;
  leafSide?: "left" | "right";
}) {
  const stemWidth = getBouquetStemWidth(headSize);
  const leafWidth = getBouquetLeafWidth(headSize);
  const leafHeight = getBouquetLeafHeight(headSize);

  return (
    <div
      className="absolute bottom-0 left-1/2"
      style={{
        zIndex,
        transform: `translateX(${xOffset}px) rotate(${angle}deg)`,
        transformOrigin: "bottom center",
      }}
    >
      <motion.div
        style={{
          width: stemWidth,
          height: stemH,
          background: "linear-gradient(to top, #16a34a, #4ade80)",
          borderRadius: 999,
          boxShadow: "0 0 6px #4ade8033",
          transformOrigin: "bottom center",
          position: "relative",
          zIndex: 1,
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      />
      {leafSide && (
        <motion.div
          className="absolute"
          style={{
            bottom: stemH * 0.42,
            ...(leafSide === "left" ? { right: stemWidth + 4 } : { left: stemWidth + 4 }),
            width: leafWidth,
            height: leafHeight,
            background: "linear-gradient(135deg, #4ade80, #16a34a)",
            borderRadius: leafSide === "left" ? "80% 0 80% 0" : "0 80% 0 80%",
            transform: `rotate(${leafSide === "left" ? "20deg" : "-20deg"})`,
            boxShadow: "0 1px 4px #16a34a33",
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring" }}
        />
      )}
      <motion.div
        className="absolute left-1/2"
        style={{
          zIndex: 20,
          top: getBouquetHeadTop(headSize),
          transform: `translateX(-50%) rotate(${-angle}deg)`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.25, type: "spring", stiffness: 150 }}
      >
        <FlowerHead size={headSize} color={color} />
      </motion.div>
    </div>
  );
}

/* ── wrapping paper with ribbon ── */
function WrapPaper({ colors }: { colors: { primary: string; secondary: string; accent?: string } }) {
  return (
    <div className="relative" style={{ width: 228, height: 138 }}>
      <svg width="228" height="138" viewBox="0 0 228 138" fill="none">
        <path d="M44 0 H184 L228 138 H0 Z" fill="url(#wGrad)" />
        <path d="M44 0 H94 L70 138 H0 Z" fill="rgba(255,255,255,0.12)" />
        <path d="M134 0 H184 L228 138 H158 Z" fill="rgba(255,255,255,0.08)" />
        <path d="M110 0 Q100 72 110 138" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" fill="none" />
        <path d="M118 0 Q132 68 120 138" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" fill="none" />
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="228" y2="138" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={`${colors.accent || colors.primary}dd`} />
            <stop offset="52%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={`${colors.primary}dd`} />
          </linearGradient>
        </defs>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-[-18px] flex justify-center">
        <div className="flex items-end gap-1">
          <div style={{ width: 32, height: 18, background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}cc)`, borderRadius: "60% 60% 16% 52%", transform: "rotate(-28deg)" }} />
          <div style={{ width: 14, height: 14, background: colors.primary, borderRadius: "50%", boxShadow: `0 0 8px ${colors.primary}44` }} />
          <div style={{ width: 32, height: 18, background: `linear-gradient(135deg, ${colors.primary}cc, ${colors.primary})`, borderRadius: "60% 60% 52% 16%", transform: "rotate(28deg)" }} />
        </div>
      </div>
      <div className="absolute bottom-[-20px] left-1/2 flex -translate-x-1/2 gap-3">
        <div style={{ width: 4, height: 28, background: `linear-gradient(180deg, ${colors.primary}88, ${colors.primary}14)`, borderRadius: 999, transform: "rotate(-8deg)" }} />
        <div style={{ width: 4, height: 24, background: `linear-gradient(180deg, ${colors.primary}88, ${colors.primary}14)`, borderRadius: 999, transform: "rotate(10deg)" }} />
      </div>
    </div>
  );
}

export function BouquetGift({ gift, isPreview }: GiftViewerProps) {
  const [stage, setStage] = useState<Stage>(isPreview ? "bouquet" : "opening");
  const { colors } = gift.config;
  const showLegacyImages = shouldUseLegacyImageLayout(gift);

  const particles = useMemo(() => {
    const random = createDeterministicRandom(`bouquet:${gift.id ?? gift.templateId}:fx`);
    const fireflies = Array.from({ length: 12 }).map((_, i) => ({
      id: `ff-${i}`, x: randomInRange(random, 5, 95), y: randomInRange(random, 10, 80),
      delay: randomInRange(random, 0, 6), size: randomInRange(random, 4, 10), dur: randomInRange(random, 4, 8),
    }));
    const hearts = Array.from({ length: 8 }).map((_, i) => ({
      id: `h-${i}`, x: randomInRange(random, 5, 95), delay: randomInRange(random, 0, 10), dur: randomInRange(random, 8, 14),
      color: i % 2 === 0 ? colors.primary : colors.secondary,
    }));
    const petals = Array.from({ length: 12 }).map((_, i) => ({
      id: `p-${i}`, left: randomInRange(random, 0, 100), delay: randomInRange(random, 0, 8),
      dur: randomInRange(random, 7, 12), color: i % 2 === 0 ? colors.primary : colors.secondary,
    }));
    return { fireflies, hearts, petals };
  }, [colors.primary, colors.secondary, gift.id, gift.templateId]);

  /* bouquet flower arrangement – stems fan out from a shared origin */
  const bouquetFlowers = useMemo(() => {
    return getBouquetStemSpecs(colors);
  }, [colors]);

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${colors.secondary}22, transparent 50%), radial-gradient(circle at 20% 80%, ${colors.primary}18, transparent 40%), radial-gradient(circle at 80% 70%, ${colors.accent || colors.primary}12, transparent 35%), linear-gradient(175deg, ${colors.background || "#fdf2f8"} 0%, #fce4ec 40%, #f8bbd0 100%)`,
      }}
    >
      {/* atmospheric layers */}
      <MountainBg color={colors.primary} />
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.06) 100%)" }} />

      {/* ambient particles */}
      {particles.fireflies.map((f) => <Firefly key={f.id} x={f.x} y={f.y} delay={f.delay} size={f.size} dur={f.dur} />)}
      {particles.hearts.map((h) => <HeartParticle key={h.id} x={h.x} delay={h.delay} dur={h.dur} color={h.color} />)}
      {particles.petals.map((p) => <FallingPetal key={p.id} left={p.left} delay={p.delay} dur={p.dur} color={p.color} />)}

      {/* bokeh circles */}
      <div className="pointer-events-none absolute left-[10%] top-[20%] size-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${colors.primary}44, transparent)`, filter: "blur(30px)" }} />
      <div className="pointer-events-none absolute right-[15%] top-[15%] size-56 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${colors.secondary}44, transparent)`, filter: "blur(40px)" }} />
      <div className="pointer-events-none absolute bottom-[25%] left-[60%] size-36 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${colors.accent || colors.primary}33, transparent)`, filter: "blur(25px)" }} />

      <AnimatePresence mode="wait">
        {stage === "opening" && (
          <motion.div
            key="opening"
            className="z-10 flex flex-col items-center gap-8 px-4 text-center"
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* animated emoji bouquet */}
            <motion.div
              className="text-7xl md:text-8xl"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
            >
              <motion.span
                className="inline-block"
                animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                💐
              </motion.span>
            </motion.div>

            <motion.h1
              className="max-w-2xl text-3xl font-bold md:text-5xl"
              style={{ fontFamily: "var(--font-display)", color: colors.primary, textShadow: `0 2px 20px ${colors.primary}33` }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {gift.recipientName
                ? `${gift.recipientName} ơi,`
                : "Xin chào,"}
            </motion.h1>
            <motion.p
              className="max-w-md text-lg leading-relaxed"
              style={{ color: `${colors.primary}cc` }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Một bó hoa đặc biệt đang chờ bạn
            </motion.p>
            <motion.button
              type="button"
              className="relative overflow-hidden rounded-full px-10 py-4 text-base font-bold text-white shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 8px 32px ${colors.primary}44` }}
              whileHover={{ scale: 1.06, boxShadow: `0 12px 40px ${colors.primary}66` }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => setStage("bouquet")}
            >
              <span className="relative z-10">✨ Mở bó hoa</span>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)` }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.button>
          </motion.div>
        )}

        {stage === "bouquet" && (
          <motion.div
            key="bouquet"
            className="z-10 flex flex-col items-center gap-5 px-4"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
          >
            {/* title */}
            <motion.h2
              className="text-center text-2xl font-bold tracking-wide md:text-3xl"
              style={{ fontFamily: "var(--font-display)", color: colors.primary, textShadow: `0 0 20px ${colors.primary}44` }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Happy Women&apos;s Day 🌸
            </motion.h2>

            {/* unified bouquet composition – flowers connected to stems */}
            <motion.div
              className="relative"
              style={{ width: BOUQUET_LAYOUT.sceneWidth, height: BOUQUET_LAYOUT.sceneHeight }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* soft glow behind flowers */}
              <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                style={{
                  top: BOUQUET_LAYOUT.glowTop,
                  width: BOUQUET_LAYOUT.glowWidth,
                  height: BOUQUET_LAYOUT.glowHeight,
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse, ${colors.primary}18, transparent)`,
                  filter: "blur(28px)",
                }}
              />

              <div
                className="absolute left-1/2"
                style={{ bottom: BOUQUET_LAYOUT.stemOriginBottom, width: 0, height: 0 }}
              >
                {bouquetFlowers.map((f, i) => (
                  <BouquetUnit key={i} {...f} />
                ))}
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  style={{ transformOrigin: "top center" }}
                >
                  <WrapPaper colors={colors} />
                </motion.div>
              </div>
            </motion.div>

            {/* photo thumbnails */}
            {showLegacyImages && gift.images.length > 0 && (
              <motion.div
                className="flex gap-3 rounded-full px-4 py-2"
                style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: `1px solid ${colors.primary}18`, boxShadow: `0 8px 24px ${colors.primary}15` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                {gift.images.slice(0, 4).map((img, i) => (
                  <motion.div
                    key={i}
                    className="h-14 w-14 overflow-hidden rounded-full shadow-md"
                    style={{ border: `2.5px solid ${colors.primary}`, boxShadow: `0 0 12px ${colors.primary}22` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4 + i * 0.1, type: "spring" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.publicUrl || img.url} alt={img.label || ""} className="h-full w-full object-cover" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* CTA */}
            <motion.button
              type="button"
              className="relative overflow-hidden rounded-full px-10 py-3.5 text-base font-bold text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 8px 28px ${colors.primary}44` }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              onClick={() => setStage("message")}
            >
              <span className="relative z-10">💌 Xem lời chúc</span>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
            </motion.button>
          </motion.div>
        )}

        {stage === "message" && (
          <motion.div
            key="message"
            className="z-20 flex w-full max-w-lg flex-col items-center px-4"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 14 }}
          >
            {/* floating emojis above card */}
            <motion.div
              className="mb-4 flex gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {["🌷", "🌸", "💐", "🌸", "🌷"].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
                >
                  {e}
                </motion.span>
              ))}
            </motion.div>

            {/* elegant message card */}
            <motion.div
              className="relative w-full overflow-hidden p-[2.5px]"
              style={{ borderRadius: 28 }}
              initial={{ scale: 0.92, rotateX: 8 }}
              animate={{ scale: 1, rotateX: 0 }}
              transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
            >
              {/* gradient border */}
              <div className="absolute inset-0 rounded-[28px]" style={{ background: `linear-gradient(135deg, ${colors.primary}55, ${colors.accent || colors.secondary}44, ${colors.primary}55)` }} />

              {/* inner paper card */}
              <div
                className="relative rounded-[26px] px-8 py-10 md:px-10 md:py-12"
                style={{
                  background: "linear-gradient(180deg, #fffdf8 0%, #fef9f0 50%, #fdf5ea 100%)",
                  boxShadow: `inset 0 2px 0 rgba(255,255,255,0.9), 0 30px 70px -20px ${colors.primary}33`,
                }}
              >
                {/* decorative tape corners */}
                <div className="absolute -left-1.5 -top-1.5 size-11 -rotate-12 rounded-sm" style={{ background: `${colors.primary}15`, border: `1px dashed ${colors.primary}33` }} />
                <div className="absolute -bottom-1.5 -right-1.5 size-11 rotate-12 rounded-sm" style={{ background: `${colors.primary}15`, border: `1px dashed ${colors.primary}33` }} />

                {/* top flourish divider */}
                <motion.div
                  className="mb-6 flex items-center justify-center gap-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, transparent, ${colors.primary}44)`, borderRadius: 1 }} />
                  <span className="text-lg" style={{ color: colors.primary }}>🌸</span>
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, ${colors.primary}44, transparent)`, borderRadius: 1 }} />
                </motion.div>

                {/* recipient name */}
                {gift.recipientName && (
                  <motion.p
                    className="mb-5 text-center text-xl font-semibold italic md:text-2xl"
                    style={{ color: colors.primary, fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Gửi {gift.recipientName} thương mến,
                  </motion.p>
                )}

                {/* main message – larger text, elegant reveal */}
                <motion.div
                  className="whitespace-pre-wrap text-center text-xl leading-[2] md:text-2xl"
                  style={{ fontFamily: "var(--font-display)", color: "#3d2030" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  {gift.message}
                </motion.div>

                {/* inline images */}
                {showLegacyImages && gift.images.length > 0 && (
                  <motion.div
                    className="mt-8 flex justify-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    {gift.images.slice(0, 4).map((img, i) => (
                      <motion.div
                        key={i}
                        className="h-16 w-16 overflow-hidden rounded-xl shadow-lg"
                        style={{ border: `2px solid ${colors.primary}33` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + i * 0.1, type: "spring" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.publicUrl || img.url} alt={img.label || ""} className="h-full w-full object-cover" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* sender name */}
                {gift.senderName && (
                  <motion.p
                    className="mt-8 text-right text-lg font-semibold italic md:text-xl"
                    style={{ color: colors.primary, fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Với yêu thương, {gift.senderName} 💕
                  </motion.p>
                )}

                {/* bottom flourish divider */}
                <motion.div
                  className="mt-6 flex items-center justify-center gap-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, transparent, ${colors.primary}44)`, borderRadius: 1 }} />
                  <span className="text-lg" style={{ color: colors.primary }}>✿</span>
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, ${colors.primary}44, transparent)`, borderRadius: 1 }} />
                </motion.div>
              </div>
            </motion.div>

            {/* back button */}
            <motion.button
              type="button"
              className="mt-6 text-sm font-medium"
              style={{ color: colors.primary }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStage("bouquet")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              ← Xem lại bó hoa
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

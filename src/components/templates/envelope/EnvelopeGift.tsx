"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftViewerProps } from "@/types/gift";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import { shouldUseLegacyImageLayout } from "@/lib/gift-effects";

/* ── Confetti with hearts ── */
function Confetti({ colors, seed }: { colors: string[]; seed: string }) {
  const pieces = useMemo(() => {
    const random = createDeterministicRandom(`${seed}:confetti`);
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: randomInRange(random, 10, 90),
      delay: randomInRange(random, 0, 0.6),
      dur: randomInRange(random, 1.5, 3.5),
      color: colors[i % colors.length],
      size: randomInRange(random, 6, 16),
      rotation: randomInRange(random, 0, 360),
      driftY: randomInRange(random, -500, -200),
      driftX: randomInRange(random, -120, 120),
      isHeart: i % 5 === 0,
    }));
  }, [colors, seed]);

  return (
    <>
      {pieces.map((c) => (
        <motion.div
          key={c.id}
          className="pointer-events-none absolute"
          style={{
            left: `${c.x}%`,
            top: "45%",
            width: c.isHeart ? undefined : c.size,
            height: c.isHeart ? undefined : c.size * 0.6,
            background: c.isHeart ? undefined : c.color,
            borderRadius: c.isHeart ? undefined : 2,
            color: c.color,
            fontSize: c.isHeart ? c.size : undefined,
          }}
          initial={{ y: 0, rotate: 0, opacity: 1, scale: 0 }}
          animate={{
            y: [0, c.driftY, 600],
            x: [0, c.driftX],
            rotate: c.rotation + 720,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.5],
          }}
          transition={{ duration: c.dur, delay: c.delay, ease: "easeOut" }}
        >
          {c.isHeart ? "♥" : null}
        </motion.div>
      ))}
    </>
  );
}

/* ── Floating heart (always visible, gentle bob) ── */
function FloatingHeart({ x, y, delay, dur, size, color }: { x: number; y: number; delay: number; dur: number; size: number; color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, color, fontSize: size, filter: `drop-shadow(0 0 4px ${color}44)` }}
      animate={{ y: [0, -18, 0], opacity: [0.25, 0.6, 0.25], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      ♥
    </motion.div>
  );
}

/* ── Sparkle dot ── */
function Sparkle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)", filter: "blur(0.5px)" }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function EnvelopeGift({ gift, isPreview }: GiftViewerProps) {
  const [stage, setStage] = useState<"closed" | "opening" | "open">(isPreview ? "open" : "closed");
  const { colors } = gift.config;
  const showLegacyImages = shouldUseLegacyImageLayout(gift);

  const sparkles = useMemo(() => {
    const random = createDeterministicRandom(`env:${gift.id ?? gift.templateId}:sparkle`);
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i, x: randomInRange(random, 5, 95), y: randomInRange(random, 5, 95),
      delay: randomInRange(random, 0, 4), size: randomInRange(random, 3, 7),
    }));
  }, [gift.id, gift.templateId]);

  const floatingHearts = useMemo(() => {
    const random = createDeterministicRandom(`env:${gift.id ?? gift.templateId}:hearts`);
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i, x: randomInRange(random, 3, 97), y: randomInRange(random, 5, 90),
      delay: randomInRange(random, 0, 6), dur: randomInRange(random, 4, 7),
      size: randomInRange(random, 12, 28),
      color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? `${colors.secondary}bb` : `${colors.accent || colors.primary}99`,
    }));
  }, [gift.id, gift.templateId, colors.primary, colors.secondary, colors.accent]);

  const handleOpen = () => {
    setStage("opening");
    setTimeout(() => setStage("open"), 1400);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${colors.primary}18, transparent 50%), radial-gradient(circle at 20% 80%, ${colors.secondary}15, transparent 40%), radial-gradient(circle at 80% 60%, ${colors.accent || colors.primary}10, transparent 35%), linear-gradient(165deg, ${colors.background || "#f5eeef"} 0%, #f0e0e5 50%, #ead5de 100%)`,
      }}
    >
      {/* bokeh */}
      <div className="pointer-events-none absolute left-[8%] top-[15%] size-48 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${colors.primary}44, transparent)`, filter: "blur(40px)" }} />
      <div className="pointer-events-none absolute bottom-[20%] right-[12%] size-56 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${colors.secondary}44, transparent)`, filter: "blur(45px)" }} />

      {/* floating hearts */}
      {floatingHearts.map((h) => <FloatingHeart key={h.id} x={h.x} y={h.y} delay={h.delay} dur={h.dur} size={h.size} color={h.color} />)}

      {/* sparkles */}
      {sparkles.map((s) => <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} size={s.size} />)}

      <AnimatePresence>
        {stage === "opening" && (
          <Confetti
            seed={gift.id ?? gift.templateId}
            colors={[colors.primary, colors.secondary, colors.accent || "#fde68a", "#fff", "#ff69b4"]}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {(stage === "closed" || stage === "opening") && (
          <motion.div
            key="envelope"
            className="relative z-10 cursor-pointer"
            style={{ width: 340, height: 230 }}
            exit={{ scale: 0.4, opacity: 0, y: -120, rotate: -10 }}
            transition={{ duration: 0.6 }}
            onClick={stage === "closed" ? handleOpen : undefined}
          >
            {/* envelope shadow */}
            <div className="absolute inset-x-4 -bottom-4 h-12 rounded-full opacity-30" style={{ background: `radial-gradient(ellipse, ${colors.primary}66, transparent)`, filter: "blur(12px)" }} />

            {/* Envelope body */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[24px]"
              style={{
                background: `linear-gradient(145deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 30px 60px -20px ${colors.primary}55`,
              }}
            >
              {/* subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }} />
            </div>

            {/* inner paper peek */}
            <motion.div
              className="absolute left-4 right-4 top-8 rounded-lg bg-white/20"
              style={{ height: 80 }}
              animate={stage === "opening" ? { y: -30, opacity: 0 } : {}}
              transition={{ duration: 0.5 }}
            />

            {/* Envelope flap */}
            <motion.div
              className="absolute left-0 right-0 top-0 z-10"
              style={{
                height: 110,
                background: `linear-gradient(180deg, ${colors.primary}ee, ${colors.secondary})`,
                clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                transformOrigin: "top center",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              animate={stage === "opening" ? { rotateX: 180 } : {}}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />

            {/* Wax seal */}
            <motion.div
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              animate={
                stage === "closed"
                  ? { scale: [1, 1.12, 1], boxShadow: ["0 0 0px transparent", `0 0 28px ${colors.primary}66`, "0 0 0px transparent"] }
                  : { scale: 0, opacity: 0, rotate: 180 }
              }
              transition={
                stage === "closed"
                  ? { duration: 2, repeat: Infinity }
                  : { duration: 0.4 }
              }
            >
              <div
                className="flex size-20 items-center justify-center rounded-full shadow-2xl"
                style={{ background: "linear-gradient(135deg, #fffaf5, #fff8ee)", border: `2px solid ${colors.primary}33`, boxShadow: `0 8px 24px ${colors.primary}44` }}
              >
                <span className="text-3xl">💌</span>
              </div>
            </motion.div>

            {stage === "closed" && (
              <motion.p
                className="absolute -bottom-12 left-0 right-0 text-center text-sm font-medium"
                style={{ color: `${colors.primary}bb` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                ✨ Chạm để mở phong thư
              </motion.p>
            )}
          </motion.div>
        )}

        {stage === "open" && (
          <motion.div
            key="letter"
            className="z-10 w-full max-w-lg"
            initial={{ y: 80, opacity: 0, scale: 0.85 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            {/* letter card with paper texture feel */}
            <motion.div
              className="relative overflow-hidden rounded-[28px] p-[2.5px]"
              initial={{ scale: 0.92, rotateX: 6 }}
              animate={{ scale: 1, rotateX: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="absolute inset-0 rounded-[28px]" style={{ background: `linear-gradient(135deg, ${colors.primary}55, ${colors.secondary}44, ${colors.primary}55)` }} />
              <div
                className="relative rounded-[26px] px-8 py-10 md:px-10 md:py-12"
                style={{ background: "linear-gradient(180deg, #fffdf8 0%, #fef9f0 50%, #fdf5ea 100%)", boxShadow: `inset 0 2px 0 rgba(255,255,255,0.9), 0 30px 70px -20px ${colors.primary}33` }}
              >
                {/* decorative stamp */}
                <motion.div
                  className="absolute right-5 top-5 flex size-16 items-center justify-center rounded-full"
                  style={{ border: `2px dashed ${colors.primary}44`, background: `${colors.primary}08` }}
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <span className="text-3xl">💐</span>
                </motion.div>

                {/* decorative tape corners */}
                <div className="absolute -left-1.5 -top-1.5 size-11 -rotate-12 rounded-sm" style={{ background: `${colors.primary}15`, border: `1px dashed ${colors.primary}33` }} />
                <div className="absolute -bottom-1.5 -right-1.5 size-11 rotate-12 rounded-sm" style={{ background: `${colors.primary}15`, border: `1px dashed ${colors.primary}33` }} />

                {/* top flourish */}
                <motion.div
                  className="mb-6 flex items-center justify-center gap-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, transparent, ${colors.primary}44)`, borderRadius: 1 }} />
                  <span className="text-lg" style={{ color: colors.primary }}>✿</span>
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, ${colors.primary}44, transparent)`, borderRadius: 1 }} />
                </motion.div>

                {(gift.config.letterHeading || gift.recipientName) && (
                  <motion.p
                    className="mb-5 text-center text-xl font-semibold italic md:text-2xl"
                    style={{ color: colors.secondary, fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {gift.config.letterHeading || `Thân gửi ${gift.recipientName},`}
                  </motion.p>
                )}

                <motion.div
                  className="whitespace-pre-wrap text-center text-xl leading-[2] md:text-2xl"
                  style={{ fontFamily: "var(--font-display)", color: "#2f1a2a" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  {gift.message}
                </motion.div>

                {showLegacyImages && gift.images.length > 0 && (
                  <motion.div
                    className="mt-7 flex flex-wrap justify-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {gift.images.map((img, i) => (
                      <motion.div
                        key={i}
                        className="h-16 w-16 overflow-hidden rounded-xl shadow-lg"
                        style={{ border: `2px solid ${colors.primary}22` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.publicUrl || img.url} alt={img.label || ""} className="h-full w-full object-cover" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {(gift.config.letterSignature || gift.senderName) && (
                  <motion.p
                    className="mt-8 text-right text-lg font-semibold italic md:text-xl"
                    style={{ color: colors.primary, fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    {gift.config.letterSignature || `Với tất cả yêu thương, ${gift.senderName} 💕`}
                  </motion.p>
                )}

                {/* bottom flourish */}
                <motion.div
                  className="mt-6 flex items-center justify-center gap-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, transparent, ${colors.primary}44)`, borderRadius: 1 }} />
                  <span className="text-lg" style={{ color: colors.primary }}>🌸</span>
                  <div style={{ width: 48, height: 1.5, background: `linear-gradient(90deg, ${colors.primary}44, transparent)`, borderRadius: 1 }} />
                </motion.div>
              </div>
            </motion.div>

            <motion.button
              type="button"
              className="mx-auto mt-5 block text-sm font-medium"
              style={{ color: colors.primary }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setStage("closed")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ← Xem lại phong bì
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

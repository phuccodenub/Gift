"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftViewerProps } from "@/types/gift";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import {
  shouldUseLegacyFlowerTreeScene,
  shouldUseLegacyImageLayout,
} from "@/lib/gift-effects";
import { getFlowerTreeScene } from "@/lib/flower-tree-scene";

/* ── Shooting star ── */
function ShootingStar({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${x}%`, top: `${y}%`, width: 2, height: 2, background: "#fff", borderRadius: "50%", boxShadow: "0 0 6px 2px rgba(255,255,255,0.6)" }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], x: 120, y: 60 }}
      transition={{ duration: 1.2, delay, repeat: Infinity, repeatDelay: delay * 3 + 8 }}
    />
  );
}

/* ── Firefly cluster ── */
function Firefly({ x, y, delay, size, dur }: { x: number; y: number; delay: number; size: number; dur: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: "radial-gradient(circle, #ffe4b5, #ffd70066, transparent)", filter: "blur(1px)" }}
      animate={{ opacity: [0, 0.8, 0.3, 0.9, 0], y: [0, -20, -40] }}
      transition={{ duration: dur, delay, repeat: Infinity, repeatDelay: dur * 0.4, ease: "easeInOut" }}
    />
  );
}

/* ── Mountain silhouette ── */
function NightMountains({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0" style={{ height: "40%" }}>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute bottom-0 h-full w-full">
        <path d="M0,280 Q200,160 400,240 Q600,320 800,200 Q1000,120 1200,220 Q1350,280 1440,240 L1440,400 L0,400Z" fill={`${color}12`} />
        <path d="M0,320 Q180,240 360,290 Q540,340 720,260 Q900,200 1080,280 Q1260,340 1440,300 L1440,400 L0,400Z" fill={`${color}20`} />
        <path d="M0,360 Q240,310 480,340 Q720,370 960,330 Q1200,310 1440,350 L1440,400 L0,400Z" fill={`${color}2a`} />
      </svg>
    </div>
  );
}

/* ── Glowing tree flower ── */
function TreeFlower({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x - size / 2, top: y - size / 2 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 150 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size * 0.38,
              height: size * 0.55,
              background: `radial-gradient(ellipse at 50% 30%, ${color}, ${color}88)`,
              transformOrigin: "50% 100%",
              transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
              boxShadow: `0 0 6px ${color}44`,
              filter: "saturate(1.3)",
            }}
          />
        ))}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size * 0.2, height: size * 0.2, background: "radial-gradient(circle, #fef3c7, #f59e0b)", boxShadow: "0 0 10px #f59e0b55" }}
        />
      </div>
      {/* glow halo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: size * 1.4, height: size * 1.4, background: `radial-gradient(circle, ${color}22, transparent)`, filter: "blur(4px)" }}
      />
    </motion.div>
  );
}

/* ── Photo bubble ── */
function PhotoBubble({
  src, label, x, y, width, height, rotation, delay, color, shape, zIndex,
}: {
  src: string; label?: string; x: number; y: number; width: number; height: number;
  rotation?: number; delay: number; color: string; shape?: "circle" | "rounded"; zIndex?: number;
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y, width, height, zIndex, transform: `rotate(${rotation ?? 0}deg)` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
    >
      <div
        className="overflow-hidden shadow-lg"
        style={{
          width: "100%", height: "100%",
          borderRadius: shape === "rounded" ? 16 : 999,
          border: `3px solid ${color}`,
          boxShadow: `0 0 20px ${color}44, 0 4px 12px rgba(0,0,0,0.2)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label || ""} className="h-full w-full object-cover" />
      </div>
      {label && (
        <p className="mt-1 max-w-[120px] truncate text-center text-xs text-white/80">{label}</p>
      )}
    </motion.div>
  );
}

/* ── Glowing trunk + branches ── */
function TreeTrunk() {
  return (
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        width: 16, height: 170,
        background: "linear-gradient(to top, #5b4a3f, #a08060)",
        borderRadius: 8, transformOrigin: "bottom center",
        boxShadow: "0 0 12px #5b4a3f44",
      }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  );
}

function TreeBranch({ x, y, angle, length, delay }: { x: number; y: number; angle: number; length: number; delay: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y, width: 7, height: length, background: "linear-gradient(to top, #5b4a3f, #a08060)", borderRadius: 4, transformOrigin: "bottom center", transform: `rotate(${angle}deg)` }}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    />
  );
}

export function FlowerTreeGift({ gift, isPreview }: GiftViewerProps) {
  const [stage, setStage] = useState<"intro" | "tree" | "message">(isPreview ? "tree" : "intro");
  const { colors } = gift.config;
  const showLegacyImages = shouldUseLegacyImageLayout(gift);
  const showLegacyScene = shouldUseLegacyFlowerTreeScene(gift);

  const flowerPositions = useMemo(() => [
    { x: 160, y: 25, size: 44, color: colors.primary },
    { x: 95, y: 55, size: 38, color: colors.secondary },
    { x: 225, y: 50, size: 38, color: colors.accent || colors.primary },
    { x: 60, y: 95, size: 32, color: colors.primary },
    { x: 255, y: 90, size: 32, color: colors.secondary },
    { x: 130, y: 85, size: 36, color: colors.accent || colors.primary },
    { x: 200, y: 80, size: 36, color: colors.primary },
    { x: 160, y: 115, size: 30, color: colors.secondary },
  ], [colors]);

  const photoPositions = useMemo(() => [
    { x: 30, y: 40 }, { x: 240, y: 35 }, { x: 10, y: 140 }, { x: 260, y: 140 },
  ], []);

  const scene = useMemo(() => getFlowerTreeScene(gift), [gift]);
  const sceneImageElements = useMemo(() => (scene?.elements ?? []).filter((el) => el.type === "image"), [scene]);
  const sceneTextElements = useMemo(() => (scene?.elements ?? []).filter((el) => el.type === "text"), [scene]);
  const imageByAssetId = useMemo(() => {
    const pairs = gift.images.filter((img) => Boolean(img.assetId)).map((img) => [img.assetId as string, img] as const);
    return new Map(pairs);
  }, [gift.images]);

  const ambient = useMemo(() => {
    const random = createDeterministicRandom(`flower-tree:${gift.id ?? gift.templateId}:ambient`);
    const stars = Array.from({ length: 30 }).map((_, i) => ({
      id: `s-${i}`, size: randomInRange(random, 1.5, 4), left: randomInRange(random, 0, 100),
      top: randomInRange(random, 0, 55), duration: randomInRange(random, 2, 5), delay: randomInRange(random, 0, 3),
    }));
    const fireflies = Array.from({ length: 10 }).map((_, i) => ({
      id: `f-${i}`, x: randomInRange(random, 10, 90), y: randomInRange(random, 30, 85),
      delay: randomInRange(random, 0, 5), size: randomInRange(random, 4, 9), dur: randomInRange(random, 3, 7),
    }));
    const shootingStars = Array.from({ length: 3 }).map((_, i) => ({
      id: `ss-${i}`, x: randomInRange(random, 10, 70), y: randomInRange(random, 5, 25), delay: randomInRange(random, 2, 12),
    }));
    return { stars, fireflies, shootingStars };
  }, [gift.id, gift.templateId]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, #1a1040 0%, transparent 60%), radial-gradient(circle at 16% 8%, ${colors.primary}22, transparent 34%), radial-gradient(circle at 82% 14%, ${colors.accent || colors.secondary}14, transparent 32%), linear-gradient(175deg, #0a0618 0%, ${colors.background || "#1d1322"} 50%, #0d0a14 100%)`,
      }}
    >
      <NightMountains color={colors.primary} />

      {/* twinkling star field */}
      {ambient.stars.map((star) => (
        <motion.div
          key={star.id}
          className="pointer-events-none absolute rounded-full"
          style={{ width: star.size, height: star.size, left: `${star.left}%`, top: `${star.top}%`, background: "radial-gradient(circle, #fff, #fff8)", filter: "blur(0.3px)" }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
        />
      ))}

      {/* shooting stars */}
      {ambient.shootingStars.map((ss) => <ShootingStar key={ss.id} x={ss.x} y={ss.y} delay={ss.delay} />)}

      {/* fireflies */}
      {ambient.fireflies.map((f) => <Firefly key={f.id} x={f.x} y={f.y} delay={f.delay} size={f.size} dur={f.dur} />)}

      {/* bokeh */}
      <div className="pointer-events-none absolute left-[5%] top-[40%] size-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${colors.primary}66, transparent)`, filter: "blur(50px)" }} />
      <div className="pointer-events-none absolute bottom-[15%] right-[10%] size-48 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${colors.secondary}66, transparent)`, filter: "blur(40px)" }} />

      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            className="z-10 flex flex-col items-center gap-8 px-4 text-center"
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="text-7xl md:text-8xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
            >
              <motion.span
                className="inline-block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🌸
              </motion.span>
            </motion.div>
            <motion.h1
              className="max-w-2xl text-3xl font-bold text-white md:text-5xl"
              style={{ fontFamily: "var(--font-display)", textShadow: `0 0 30px ${colors.primary}44` }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {gift.recipientName
                ? `${gift.recipientName}, cây hoa kỷ niệm đang chờ bạn`
                : "Cây hoa kỷ niệm đang chờ bạn"}
            </motion.h1>
            <motion.p
              className="max-w-xl text-base leading-relaxed text-white/60"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Mỗi bông hoa mang một kỷ niệm, mỗi ánh sao là một lời chúc
            </motion.p>
            <motion.button
              type="button"
              className="relative overflow-hidden rounded-full px-10 py-4 text-base font-bold text-white shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 0 40px ${colors.primary}44` }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => setStage("tree")}
            >
              <span className="relative z-10">✨ Khám phá ngay!</span>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.button>
          </motion.div>
        )}

        {stage === "tree" && (
          <motion.div
            key="tree"
            className="z-10 flex flex-col items-center gap-4 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="relative overflow-hidden rounded-[32px] p-4"
              style={{ width: 340, height: 400, background: "rgba(15,10,25,0.45)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: `0 40px 80px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)` }}
            >
              {/* inner glow */}
              <div className="pointer-events-none absolute inset-0 rounded-[32px]" style={{ background: `radial-gradient(ellipse at 50% 60%, ${colors.primary}12, transparent 70%)` }} />

              <TreeTrunk />
              <TreeBranch x={153} y={135} angle={-35} length={85} delay={0.5} />
              <TreeBranch x={160} y={135} angle={35} length={85} delay={0.6} />
              <TreeBranch x={150} y={178} angle={-25} length={65} delay={0.7} />
              <TreeBranch x={163} y={178} angle={25} length={65} delay={0.8} />

              {flowerPositions.map((f, i) => (
                <TreeFlower key={i} x={f.x} y={f.y} size={f.size} color={f.color} delay={1.0 + i * 0.15} />
              ))}

              {/* Photo bubbles */}
              {showLegacyImages
                ? sceneImageElements.length > 0
                ? sceneImageElements.map((element, index) => {
                    const image = element.assetRef ? imageByAssetId.get(element.assetRef) : undefined;
                    const src = image?.publicUrl || image?.url;
                    if (!src) return null;
                    const shape = element.style?.shape === "rounded" ? "rounded" : "circle";
                    return (
                      <PhotoBubble
                        key={element.id} src={src} label={element.content || image.label}
                        x={element.transform.x} y={element.transform.y}
                        width={element.transform.width} height={element.transform.height}
                        rotation={element.transform.rotation} delay={2.0 + index * 0.15}
                        color={colors.primary} shape={shape} zIndex={element.zIndex}
                      />
                    );
                  })
                : gift.images.slice(0, 4).map((img, i) => (
                    <PhotoBubble
                      key={img.assetId || i} src={img.publicUrl || img.url} label={img.label}
                      x={photoPositions[i].x} y={photoPositions[i].y}
                      width={68} height={68} delay={2.0 + i * 0.2}
                      color={colors.primary} shape="circle" zIndex={20 + i}
                    />
                  ))
                : null}

              {showLegacyScene ? sceneTextElements.map((element, index) => (
                <motion.div
                  key={element.id}
                  className="absolute rounded-2xl border border-white/30 bg-white/10 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm"
                  style={{
                    left: element.transform.x, top: element.transform.y,
                    width: element.transform.width, minHeight: element.transform.height,
                    zIndex: element.zIndex, transform: `rotate(${element.transform.rotation ?? 0}deg)`,
                    boxShadow: `0 4px 16px rgba(0,0,0,0.3)`,
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + index * 0.1 }}
                >
                  {element.content}
                </motion.div>
              )) : null}

              {/* ground glow */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: 220, height: 24, background: `radial-gradient(ellipse, ${colors.primary}44, transparent)`, filter: "blur(8px)" }}
              />

              {/* grass tufts */}
              <div className="absolute bottom-2 left-[20%]" style={{ fontSize: 16 }}>🌱</div>
              <div className="absolute bottom-2 right-[22%]" style={{ fontSize: 16 }}>🌱</div>
            </div>

            <motion.button
              type="button"
              className="mt-4 rounded-full px-8 py-3 text-sm font-bold text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, boxShadow: `0 0 24px ${colors.primary}44` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              onClick={() => setStage("message")}
            >
              💌 Đọc lời nhắn
            </motion.button>
          </motion.div>
        )}

        {stage === "message" && (
          <motion.div
            key="message"
            className="z-20 flex w-full max-w-md flex-col items-center px-4"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            {/* paper letter with tilted angle like reference */}
            <motion.div
              className="relative w-full overflow-hidden p-[2px]"
              style={{ borderRadius: 24 }}
              initial={{ rotate: 2 }}
              animate={{ rotate: [-2, 0.5, 0] }}
              transition={{ duration: 1.5 }}
            >
              {/* decorative border */}
              <div
                className="absolute inset-0 rounded-[24px]"
                style={{ background: `linear-gradient(135deg, ${colors.primary}55, ${colors.secondary}33, ${colors.primary}55)` }}
              />
              <div
                className="relative rounded-[22px] p-8"
                style={{ background: "linear-gradient(180deg, #fffbf5, #fef7ed)", boxShadow: `inset 0 2px 0 rgba(255,255,255,0.5), 0 30px 60px -20px rgba(0,0,0,0.5)` }}
              >
                {/* decorative corner tape */}
                <div className="absolute -left-1 -top-1 size-8 rotate-[-15deg] rounded-sm" style={{ background: `${colors.primary}25`, border: `1px dashed ${colors.primary}55` }} />
                <div className="absolute -bottom-1 -right-1 size-8 rotate-[15deg] rounded-sm" style={{ background: `${colors.primary}25`, border: `1px dashed ${colors.primary}55` }} />

                {(gift.config.letterHeading || gift.recipientName) && (
                  <motion.p
                    className="mb-3 text-base font-medium italic"
                    style={{ color: colors.primary, fontFamily: "var(--font-display)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {gift.config.letterHeading || `Gửi ${gift.recipientName} thương mến,`}
                  </motion.p>
                )}
                <motion.p
                  className="whitespace-pre-wrap text-lg leading-[1.85]"
                  style={{ fontFamily: "var(--font-display)", color: "#2a1a2e" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {gift.message}
                </motion.p>
                {(gift.config.letterSignature || gift.senderName) && (
                  <motion.p
                    className="mt-8 text-right text-base font-medium italic"
                    style={{ color: colors.primary }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {gift.config.letterSignature || `${gift.senderName} 💕`}
                  </motion.p>
                )}
              </div>
            </motion.div>
            <motion.button
              type="button"
              className="mt-5 text-sm text-white/70"
              whileHover={{ scale: 1.05, color: "#fff" }}
              onClick={() => setStage("tree")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              ← Xem lại cây hoa
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

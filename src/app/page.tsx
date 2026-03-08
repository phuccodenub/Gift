"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";

const driftRandom = createDeterministicRandom("landing-drift");
const DRIFT_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: randomInRange(driftRandom, 0, 100),
  size: randomInRange(driftRandom, 8, 20),
  delay: randomInRange(driftRandom, 0, 8),
  duration: randomInRange(driftRandom, 7, 12),
}));

const STUDIO_STEPS = [
  {
    id: "01",
    title: "Chọn theme",
    description: "Chọn template và preset màu theo người nhận.",
  },
  {
    id: "02",
    title: "Biên tập",
    description: "Thêm ảnh, lời chúc, sticker và bố cục theo ý bạn.",
  },
  {
    id: "03",
    title: "Gửi quà",
    description: "Chia sẻ bằng link, QR hoặc file HTML offline.",
  },
];

const BENEFITS = [
  {
    title: "Template có cảnh quan",
    text: "Mỗi template có bố cục hình ảnh, depth, motion riêng để quà không bị lặp lại.",
  },
  {
    title: "Builder theo kiểu studio",
    text: "Preview liên tục, panel gợi ý để bạn tạo quà nhanh nhưng vẫn đẹp và cá tính.",
  },
  {
    title: "Share offline + online",
    text: "Người nhận mở trên link production hoặc file HTML không cần mạng.",
  },
];

function RevealBlock({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function DriftParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {DRIFT_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[rgba(180,44,95,0.18)]"
          style={{
            width: p.size,
            height: p.size * 0.72,
            left: `${p.left}%`,
            top: -12,
          }}
          animate={{ y: ["0vh", "110vh"], x: [0, 20, -12, 0], opacity: [0.86, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function FloralMark() {
  return (
    <div className="relative mx-auto mb-8 flex size-20 items-center justify-center rounded-full border border-[rgba(96,61,77,0.2)] bg-[rgba(255,250,248,0.82)] shadow-[0_20px_46px_-28px_rgba(49,22,36,0.68)]">
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 7L27 14L34 17L27 20L24 27L21 20L14 17L21 14L24 7Z" fill="#B42C5F" />
        <circle cx="24" cy="17" r="4.2" fill="#D8B882" />
        <path d="M24 27V39" stroke="#8F1C48" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M19 33C21 31 23 31 24 32" stroke="#8F1C48" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 33C27 31 25 31 24 32" stroke="#8F1C48" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.24]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <section ref={heroRef} className="relative px-5 pb-18 pt-8 sm:px-7 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_86%_16%,rgba(216,184,130,0.24),transparent_32%),radial-gradient(circle_at_16%_10%,rgba(180,44,95,0.2),transparent_36%)]" />
        <DriftParticles />

        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[rgba(96,61,77,0.18)] bg-[rgba(255,251,248,0.76)] px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-[var(--app-text)]">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-[rgba(143,28,72,0.1)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3L14.7 8.6L20.8 9.5L16.4 13.7L17.4 19.9L12 17L6.6 19.9L7.6 13.7L3.2 9.5L9.3 8.6L12 3Z" stroke="#8F1C48" strokeWidth="1.6" />
              </svg>
            </span>
            <span className="text-lg font-semibold font-[family-name:var(--font-display)]">GiftCraft Atelier</span>
          </div>
          <Link
            href="/create"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(125deg,#8f1c48,#b42c5f)] px-5 text-sm font-semibold text-white shadow-[0_14px_26px_-18px_rgba(73,24,45,0.8)] transition-opacity hover:opacity-90"
          >
            Mở studio
          </Link>
        </nav>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="mx-auto mt-14 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.92fr]"
        >
          <div className="text-left">
            <FloralMark />
            <p className="mb-5 inline-flex rounded-full border border-[rgba(96,61,77,0.18)] bg-[rgba(255,250,248,0.75)] px-3 py-1.5 text-sm font-semibold text-[var(--app-brand)]">
              Digital Keepsake Platform
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] text-[var(--app-text)] sm:text-6xl">
              Tạo quà tặng kỹ thuật số
              <span className="block text-[var(--app-brand)]">sang trọng và đầy cảm xúc</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--app-text-soft)]">
              GiftCraft giúp bạn biến lời chúc, kỷ niệm và hình ảnh thành một món quà có thể mở trên web hoặc offline.
              Người nhận sẽ cảm nhận được một trải nghiệm được chăm chút, không phải một tấm thiệp mẫu.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex min-h-11 items-center justify-center rounded-[16px] bg-[linear-gradient(125deg,#8f1c48,#b42c5f)] px-7 text-base font-semibold text-white shadow-[0_20px_38px_-26px_rgba(74,24,46,0.82)] transition-opacity hover:opacity-90"
              >
                Bắt đầu tạo quà
              </Link>
              <a
                href="#studio-flow"
                className="inline-flex min-h-11 items-center justify-center rounded-[16px] border border-[rgba(96,61,77,0.24)] bg-[rgba(255,251,248,0.72)] px-7 text-base font-semibold text-[var(--app-text)] transition-colors hover:bg-[rgba(255,251,248,0.95)]"
              >
                Xem quy trình
              </a>
            </div>
          </div>

          <div className="relative h-[410px] w-full">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute left-0 top-5 w-[76%] rounded-[26px] border border-[rgba(96,61,77,0.17)] bg-[rgba(255,251,248,0.78)] p-5 shadow-[0_28px_60px_-42px_rgba(46,22,37,0.75)] backdrop-blur-xl"
            >
              <p className="text-sm font-semibold text-[var(--app-brand)]">Quà 01: Bouquet Signature</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-soft)]">
                Hoa nở tung cánh, popup lời chúc và photo bubbles theo bố cục đã chỉnh.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[var(--app-brand)] animate-pulse-dot" />
                <span className="size-2.5 rounded-full bg-[var(--app-accent)] animate-pulse-dot [animation-delay:160ms]" />
                <span className="size-2.5 rounded-full bg-[var(--app-brand-strong)] animate-pulse-dot [animation-delay:320ms]" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="absolute right-2 top-28 w-[72%] rounded-[24px] border border-[rgba(96,61,77,0.16)] bg-[linear-gradient(130deg,rgba(35,23,35,0.92),rgba(63,34,55,0.92))] p-5 text-white shadow-[0_30px_62px_-44px_rgba(32,14,28,0.9)]"
            >
              <p className="text-sm font-semibold text-[var(--color-champagne-200)]">Flower Tree Editor</p>
              <p className="mt-2 text-sm leading-relaxed text-white/82">
                Drag, resize, rotate từng element trên canvas để tạo quà cá nhân hóa thật sự.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="absolute bottom-1 left-[18%] w-[74%] rounded-[20px] border border-[rgba(96,61,77,0.2)] bg-[rgba(255,251,248,0.86)] p-4 shadow-[0_20px_44px_-30px_rgba(51,19,38,0.7)]"
            >
              <p className="text-xs font-semibold uppercase text-[var(--app-brand)]">Share channels</p>
              <p className="mt-1 text-sm text-[var(--app-text-soft)]">Link canonical + QR + HTML offline secure export</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <RevealBlock className="px-5 py-12 sm:px-7 md:px-10 lg:px-14">
        <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-3">
          {BENEFITS.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="glass-panel rounded-[22px] p-5"
            >
              <h3 className="text-xl font-semibold text-[var(--app-text)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-soft)]">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </RevealBlock>

      <RevealBlock id="studio-flow" className="px-5 py-10 sm:px-7 md:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-6xl rounded-[30px] border border-[rgba(96,61,77,0.16)] bg-[rgba(255,251,248,0.8)] p-7 shadow-[0_30px_62px_-40px_rgba(52,19,37,0.64)]">
          <p className="text-sm font-semibold text-[var(--app-brand)]">Quy trình Gift Studio</p>
          <h2 className="mt-2 text-4xl font-semibold text-[var(--app-text)]">Từ ý tưởng đến món quà hoàn chỉnh</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STUDIO_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-[18px] border border-[rgba(96,61,77,0.14)] bg-white/70 p-4"
              >
                <p className="font-semibold text-[var(--app-brand-strong)]">{step.id}</p>
                <h3 className="mt-1 text-2xl font-semibold text-[var(--app-text)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-soft)]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealBlock>

      <section className="px-5 pb-18 pt-8 text-center sm:px-7 md:px-10 lg:px-14">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-[rgba(96,61,77,0.18)] bg-[linear-gradient(132deg,#24161f,#4b1d38_60%,#7a2950)] px-6 py-12 text-white shadow-[0_28px_64px_-34px_rgba(35,14,25,0.86)] sm:px-12">
          <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">Sẵn sàng gửi một món quà có dấu ấn riêng?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85">
            Mở Gift Studio, chọn template yêu thích và tạo ra món quà có thể được chia sẻ trong vài phút.
          </p>
          <Link
            href="/create"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[16px] bg-[var(--color-champagne-200)] px-8 text-base font-semibold text-[var(--color-noir-900)] transition-colors hover:bg-[var(--color-champagne-300)]"
          >
            Mở Gift Studio ngay
          </Link>
        </div>
      </section>
    </main>
  );
}

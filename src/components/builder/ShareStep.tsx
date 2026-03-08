"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/ui/Button";
import type { GiftResponse } from "@/types/gift";

export default function ShareStep({ giftResponse }: { giftResponse: GiftResponse }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(giftResponse.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [giftResponse.shareUrl]);

  const handleDownload = useCallback(async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/export/${giftResponse.id}`);
      if (!response.ok) {
        throw new Error("Export thất bại");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `gift-${giftResponse.slug || giftResponse.id}.html`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setDownloading(false);
    }
  }, [giftResponse.id, giftResponse.slug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-7 text-center"
    >
      <div className="space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(96,61,77,0.2)] bg-[linear-gradient(125deg,#8f1c48,#b42c5f)] text-white shadow-[0_20px_44px_-28px_rgba(48,20,37,0.78)]"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>
        <h3 className="text-3xl font-semibold text-[var(--app-text)]">
          Quà tặng đã sẵn sàng
        </h3>
        <p className="text-sm text-[var(--app-text-soft)]">
          Chia sẻ link bên dưới cho người nhận để họ mở quà tặng của bạn.
        </p>
      </div>

      <div className="glass-panel rounded-[20px] p-5">
        <p className="mb-3 text-xs font-semibold uppercase text-[var(--app-brand)]">
          Link chia sẻ
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={giftResponse.shareUrl}
            className="min-h-11 flex-1 rounded-[12px] border border-[rgba(96,61,77,0.2)] bg-white/70 px-4 py-3 text-sm text-[var(--app-text)] outline-none"
          />
          <Button
            variant={copied ? "ghost" : "primary"}
            size="md"
            onClick={handleCopy}
          >
            {copied ? "Đã sao chép!" : "Sao chép"}
          </Button>
        </div>
      </div>

      <div className="glass-panel rounded-[20px] p-6">
        <p className="mb-4 text-xs font-semibold uppercase text-[var(--app-brand)]">
          Mã QR
        </p>
        <div className="flex items-center justify-center rounded-xl border border-[rgba(96,61,77,0.18)] bg-white/70 p-6">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <QRCodeSVG
              value={giftResponse.shareUrl}
              size={160}
              level="M"
              fgColor="#8f1c48"
              bgColor="transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/gift/${giftResponse.slug || giftResponse.id}`}>
          <Button variant="primary" size="lg">
            Xem quà tặng
          </Button>
        </Link>
        <Button variant="secondary" size="lg" onClick={handleDownload} loading={downloading}>
          Tải HTML
        </Button>
        <Link href="/create">
          <Button variant="secondary" size="lg">
            Tạo quà tặng mới
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

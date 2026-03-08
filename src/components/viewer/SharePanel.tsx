"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { getShareUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface SharePanelProps {
  giftId: string;
  giftSlug?: string;
  recipientName?: string;
  onClose: () => void;
}

export function SharePanel({ giftId, giftSlug, recipientName, onClose }: SharePanelProps) {
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const shareUrl = getShareUrl(giftSlug || giftId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Không thể sao chép. Thử lại trong trình duyệt khác.");
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);
      const res = await fetch(`/api/export/${giftId}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gift-${recipientName || giftId}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Không thể tải file HTML. Vui lòng thử lại.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(16,10,16,0.54)] px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-panel w-full max-w-md rounded-[28px] p-5 sm:p-6"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3
            id={titleId}
            className="text-2xl font-semibold text-[var(--app-text)]"
          >
            Chia sẻ quà tặng
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full text-[var(--app-text-soft)] transition-colors hover:bg-[rgba(180,44,95,0.1)]"
            aria-label="Đóng hộp thoại chia sẻ"
          >
            &times;
          </button>
        </div>

        <div className="mb-5 flex justify-center">
          <div className="rounded-[20px] border border-[rgba(96,61,77,0.18)] bg-[rgba(255,251,248,0.9)] p-4 shadow-[0_16px_36px_-28px_rgba(34,20,33,0.75)]">
            <QRCodeSVG
              value={shareUrl}
              size={160}
              level="M"
              fgColor="#8f1c48"
              bgColor="transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-[var(--app-text-soft)]">Link chia sẻ</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="min-h-11 flex-1 rounded-[12px] border border-[rgba(96,61,77,0.2)] bg-white/70 px-3 py-2 text-sm text-[var(--app-text)]"
            />
            <Button variant={copied ? "ghost" : "primary"} size="sm" onClick={handleCopy}>
              {copied ? "Đã copy!" : "Copy"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            size="md"
            onClick={handleDownload}
            loading={downloading}
            fullWidth
          >
            Tải file HTML
          </Button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[14px] bg-[linear-gradient(125deg,#8f1c48,#b42c5f)] px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Xem quà tặng
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

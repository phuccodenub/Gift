"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GiftAudioConfig, UploadAssetResponse } from "@/types/gift";

interface AudioUploaderProps {
  audio?: GiftAudioConfig;
  onAudioChange: (audio?: GiftAudioConfig) => void;
}

export default function AudioUploader({
  audio,
  onAudioChange,
}: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      if (!["audio/mpeg", "audio/mp3"].includes(file.type)) {
        throw new Error("Chỉ chấp nhận file MP3.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Upload nhạc thất bại.");
      }

      const uploaded: UploadAssetResponse = await response.json();
      onAudioChange({
        assetId: uploaded.assetId,
        publicUrl: uploaded.publicUrl,
        objectPath: uploaded.objectPath,
        mimeType: uploaded.mimeType,
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload nhạc thất bại.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold text-[var(--app-text)]">
          Nhạc nền
        </h3>
        <p className="text-sm text-[var(--app-text-soft)]">
          Thêm 1 file MP3 tối đa 3MB. Nhạc sẽ phát sau tương tác đầu tiên khi người nhận mở quà.
        </p>
      </div>

      <div className="rounded-[18px] border border-[rgba(96,61,77,0.18)] bg-white/75 p-4">
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,audio/mpeg"
          className="hidden"
          onChange={handleInputChange}
        />

        {audio ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">
                MP3 đã sẵn sàng
              </p>
              <p className="text-xs text-[var(--app-text-soft)]">
                {audio.objectPath}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="min-h-11 rounded-[12px] border border-[rgba(143,28,72,0.2)] px-4 text-sm font-semibold text-[var(--app-brand)] transition-colors hover:bg-[rgba(143,28,72,0.08)]"
              >
                Thay MP3
              </button>
              <button
                type="button"
                onClick={() => onAudioChange(undefined)}
                className="min-h-11 rounded-[12px] border border-[rgba(96,61,77,0.16)] px-4 text-sm font-semibold text-[var(--app-text-soft)] transition-colors hover:bg-[rgba(96,61,77,0.08)]"
              >
                Gỡ bỏ
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-11 w-full items-center justify-center rounded-[14px] border border-dashed border-[rgba(96,61,77,0.25)] bg-[rgba(255,251,248,0.86)] px-4 py-6 text-sm font-semibold text-[var(--app-text)] transition-colors hover:border-[rgba(143,28,72,0.4)] hover:bg-white"
          >
            {uploading ? "Đang upload MP3..." : "Chọn file MP3"}
          </button>
        )}

        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-sm text-[var(--app-text-soft)]"
            >
              Đang tải nhạc lên...
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GiftImageData, UploadAssetResponse } from "@/types/gift";

interface ImageUploaderProps {
  images: GiftImageData[];
  onImagesChange: (images: GiftImageData[]) => void;
}

const MAX_IMAGES = 5;
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const TARGET_MAX_WIDTH = 1600;
const TARGET_MAX_HEIGHT = 1600;
const TARGET_FILE_BYTES = 1.4 * 1024 * 1024;

async function resizeAndCompress(file: File): Promise<File> {
  if (
    typeof window === "undefined" ||
    !file.type.startsWith("image/") ||
    file.size <= TARGET_FILE_BYTES
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(
        1,
        TARGET_MAX_WIDTH / image.width,
        TARGET_MAX_HEIGHT / image.height,
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(file);
            return;
          }
          const optimized = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
            type: "image/webp",
          });
          resolve(optimized.size < file.size ? optimized : file);
        },
        "image/webp",
        0.82,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    image.src = url;
  });
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUpload = images.length < MAX_IMAGES;

  const uploadFile = useCallback(
    async (file: File): Promise<GiftImageData | null> => {
      if (!file.type.startsWith("image/")) {
        setError("Chỉ chấp nhận file ảnh.");
        return null;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("Kích thước ảnh tối đa là 2MB.");
        return null;
      }

      const optimized = await resizeAndCompress(file);
      const formData = new FormData();
      formData.append("file", optimized);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error || "Upload thất bại. Vui lòng thử lại.");
        return null;
      }

      const data: UploadAssetResponse = await res.json();
      return {
        assetId: data.assetId,
        objectPath: data.objectPath,
        publicUrl: data.publicUrl,
        url: data.publicUrl,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        label: "",
      } satisfies GiftImageData;
    },
    [],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);

      const fileArray = Array.from(files);
      const slotsLeft = MAX_IMAGES - images.length;
      if (slotsLeft <= 0) {
        setError(`Tối đa ${MAX_IMAGES} ảnh.`);
        return;
      }
      const batch = fileArray.slice(0, slotsLeft);

      setUploading(true);
      try {
        const results = await Promise.all(batch.map(uploadFile));
        const newImages: GiftImageData[] = results
          .filter((asset): asset is GiftImageData => Boolean(asset));

        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages]);
        }
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, uploadFile],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = "";
      }
    },
    [handleFiles],
  );

  const removeImage = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange],
  );

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-[var(--app-text)]">
        Hình ảnh
      </h3>
      <p className="text-sm text-[var(--app-text-soft)]">
        Nên chọn bộ ảnh cùng tông màu để món quà có cảm giác liền mạch.
      </p>

      {canUpload && (
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          className={cn(
            "relative flex min-h-11 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed p-8 cursor-pointer transition-colors duration-200",
            dragging
              ? "border-[var(--app-brand)] bg-[rgba(216,136,161,0.12)]"
              : "border-[rgba(96,61,77,0.22)] bg-white/70 hover:border-[rgba(143,28,72,0.4)] hover:bg-[rgba(255,251,248,0.95)]",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex size-12 items-center justify-center rounded-full bg-[linear-gradient(140deg,#8f1c48,#b42c5f)] text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="text-sm font-medium text-[var(--app-text)]">
            Kéo thả hoặc nhấn để chọn ảnh
          </p>
          <p className="text-xs text-[var(--app-text-soft)]">
            Tối đa {MAX_IMAGES} ảnh, mỗi ảnh không quá 2MB
          </p>

          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-[rgba(255,251,248,0.8)]"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[rgba(143,28,72,0.24)] border-t-[var(--app-brand)]" />
            </motion.div>
          )}
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-red-500"
        >
          {error}
        </motion.p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <AnimatePresence mode="popLayout">
            {images.map((img, idx) => (
              <motion.div
                key={img.assetId || `${img.url}-${idx}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="group relative aspect-square overflow-hidden rounded-[12px] border border-[rgba(96,61,77,0.2)] bg-white/70"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.publicUrl || img.url}
                  alt={img.label || `Ảnh ${idx + 1}`}
                  className="h-full w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-1 top-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[rgba(22,14,20,0.58)] text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[rgba(143,28,72,0.9)] cursor-pointer"
                  aria-label="Xóa ảnh"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-right text-xs text-[var(--app-text-soft)]">
        {images.length}/{MAX_IMAGES} ảnh
      </p>
    </div>
  );
}

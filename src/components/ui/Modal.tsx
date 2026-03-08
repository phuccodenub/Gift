"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 350, damping: 30 },
  },
  exit: { opacity: 0, y: 40, scale: 0.96, transition: { duration: 0.2 } },
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            onClick={onClose}
          />

          <motion.div
            variants={panelVariants}
            className={cn(
              "relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl shadow-pink-500/10 border border-pink-100",
              className,
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3 bg-white/90 backdrop-blur-sm rounded-t-2xl">
              {title && (
                <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-pink-900">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full hover:bg-pink-100 text-pink-400 hover:text-pink-600 transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

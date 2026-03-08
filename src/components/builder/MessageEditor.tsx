"use client";

import { motion } from "framer-motion";
import {
  MAX_FLOATING_MESSAGES,
  MAX_FLOATING_MESSAGE_LENGTH,
  parseFloatingMessagesInput,
} from "@/lib/gift-effects";
import { cn } from "@/lib/utils";

interface MessageEditorProps {
  value: string;
  onChange: (text: string) => void;
  floatingMessagesInput: string;
  onFloatingMessagesChange: (text: string) => void;
  senderName: string;
  recipientName: string;
  onSenderChange: (name: string) => void;
  onRecipientChange: (name: string) => void;
}

const MAX_LENGTH = 500;

export default function MessageEditor({
  value,
  onChange,
  floatingMessagesInput,
  onFloatingMessagesChange,
  senderName,
  recipientName,
  onSenderChange,
  onRecipientChange,
}: MessageEditorProps) {
  const remaining = MAX_LENGTH - value.length;
  const floatingMessages = parseFloatingMessagesInput(floatingMessagesInput);

  return (
    <div className="space-y-5">
      <h3 className="text-2xl font-semibold text-[var(--app-text)]">
        Thương hiệu thông điệp
      </h3>
      <p className="text-sm text-[var(--app-text-soft)]">
        Viết thông điệp ngắn gọn, ấm áp. Độ dài lý tưởng từ 80 đến 160 ký tự để người nhận đọc trọn vẹn.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--app-text)]">
            Người gửi
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => onSenderChange(e.target.value)}
            placeholder="Tên của bạn..."
            maxLength={50}
            className="min-h-11 w-full rounded-[14px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-2.5 text-[var(--app-text)] placeholder:text-[rgba(95,67,88,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.25)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--app-text)]">
            Người nhận
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="Tên người nhận..."
            maxLength={50}
            className="min-h-11 w-full rounded-[14px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-2.5 text-[var(--app-text)] placeholder:text-[rgba(95,67,88,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.25)]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--app-text)]">
          Nội dung lời chúc
        </label>

        <div className="relative">
          <motion.textarea
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) onChange(e.target.value);
            }}
            placeholder="Gửi lời chúc yêu thương nhân ngày 8/3..."
            rows={5}
            whileFocus={{ borderColor: "rgb(244 114 182)" }}
            className="w-full resize-none rounded-[16px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-3 leading-relaxed text-[var(--app-text)] placeholder:text-[rgba(95,67,88,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.25)]"
          />

          <span
            className={cn(
              "absolute bottom-3 right-3 text-xs font-medium",
              remaining < 50 ? "text-red-500" : "text-[var(--app-text-soft)]",
            )}
          >
            {value.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--app-text)]">
          Những câu nhắn nhỏ rơi trên màn hình
        </label>
        <p className="text-sm text-[var(--app-text-soft)]">
          Mỗi dòng là một câu ngắn. Tối đa {MAX_FLOATING_MESSAGES} câu, mỗi câu tối đa {MAX_FLOATING_MESSAGE_LENGTH} ký tự.
        </p>
        <textarea
          value={floatingMessagesInput}
          onChange={(e) => {
            const nextValue = e.target.value
              .split(/\r?\n/g)
              .slice(0, MAX_FLOATING_MESSAGES)
              .map((line) => line.slice(0, MAX_FLOATING_MESSAGE_LENGTH))
              .join("\n");
            onFloatingMessagesChange(nextValue);
          }}
          placeholder={"Mãi xinh đẹp nhé\nCảm ơn vì đã luôn dịu dàng\nChúc em thật nhiều niềm vui"}
          rows={4}
          className="w-full resize-none rounded-[16px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-3 leading-relaxed text-[var(--app-text)] placeholder:text-[rgba(95,67,88,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.25)]"
        />
        <div className="flex items-center justify-between text-xs text-[var(--app-text-soft)]">
          <span>{floatingMessages.length}/{MAX_FLOATING_MESSAGES} câu</span>
          <span>Dòng dài hơn sẽ tự cắt ở {MAX_FLOATING_MESSAGE_LENGTH} ký tự</span>
        </div>
      </div>
    </div>
  );
}

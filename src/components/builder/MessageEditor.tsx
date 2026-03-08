"use client";

import { useState, useCallback } from "react";
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
  letterHeading: string;
  letterSignature: string;
  onLetterHeadingChange: (text: string) => void;
  onLetterSignatureChange: (text: string) => void;
}

const MESSAGE_TEMPLATES = [
  {
    label: "💖 Cho mẹ",
    heading: "Gửi người mẹ yêu quý của con,",
    message:
      "8/3 này con chúc mẹ thật nhiều sức khỏe, nụ cười và bình yên.\n\nMẹ là người phụ nữ đẹp nhất trong mắt con — không phải vì ngoại hình mà vì tấm lòng nhân hậu, sự hy sinh thầm lặng và tình yêu vô bờ dành cho gia đình.\n\nCon mong mẹ đừng quá vất vả, hãy dành thời gian cho bản thân. Con sẽ cố gắng để mẹ tự hào và được an lòng.",
    signature: "Con yêu mẹ nhiều lắm! 💕",
  },
  {
    label: "🌹 Cho người yêu",
    heading: "Gửi người em yêu nhất,",
    message:
      "8/3 này anh muốn nói với em rằng — có em trong cuộc đời, mọi thứ trở nên ý nghĩa hơn rất nhiều.\n\nAnh yêu nụ cười của em, yêu cả những lúc em nhăn mặt, yêu từng khoảnh khắc bình thường mà chúng ta có nhau.\n\nChúc em ngày 8/3 thật vui, luôn rạng rỡ và biết rằng em được yêu thương mỗi ngày.",
    signature: "Của anh mãi mãi 🌹",
  },
  {
    label: "👭 Cho bạn thân",
    heading: "Gửi người bạn tuyệt nhất của tớ,",
    message:
      "Nhân ngày 8/3, tớ muốn cảm ơn cậu vì đã luôn ở đây — khi vui lẫn khi khóc, khi chán đời và khi phấn chấn không lý do.\n\nCậu là loại bạn bè hiếm có mà ai cũng mong có trong đời. Tớ may mắn lắm mới gặp được cậu!\n\nChúc năm nay cậu đạt được mọi điều muốn, và tiếp tục rực rỡ theo cách chỉ cậu mới làm được.",
    signature: "Bạn thân nhất của cậu 🫂",
  },
  {
    label: "🏢 Cho đồng nghiệp",
    heading: "Gửi người đồng nghiệp tuyệt vời,",
    message:
      "Nhân ngày Quốc tế Phụ nữ 8/3, chúc chị/em luôn tỏa sáng và thành công trong công việc cũng như cuộc sống.\n\nSự chuyên nghiệp, nhiệt huyết và nụ cười của chị/em là nguồn động lực cho cả team mỗi ngày.\n\nChúc chị/em ngày 8/3 thật ý nghĩa, nhiều niềm vui và được chiều chuộng xứng đáng!",
    signature: "Trân trọng và yêu quý 🌸",
  },
  {
    label: "✨ Ngắn & ngọt",
    heading: "",
    message:
      "Chúc mừng ngày 8/3!\n\nChúc bạn luôn xinh đẹp, hạnh phúc và rực rỡ như chính con người bạn vốn có. Hôm nay là ngày của bạn — hãy tận hưởng hết mình nhé! 🌸",
    signature: "",
  },
  {
    label: "💌 Xa cách",
    heading: "Gửi người mình nhớ,",
    message:
      "8/3 này dù không được ở bên nhau, nhưng lòng mình luôn hướng về bạn.\n\nNhớ từng nụ cười, từng ánh mắt, những khoảnh khắc bình dị mà chúng ta đã có cùng nhau.\n\nChúc bạn ngày 8/3 thật vui, luôn rạng rỡ — và biết rằng dù xa cách thế nào, bạn vẫn luôn được nhớ đến.",
    signature: "Người luôn nhớ bạn 🌹",
  },
];

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
  letterHeading,
  letterSignature,
  onLetterHeadingChange,
  onLetterSignatureChange,
}: MessageEditorProps) {
  const remaining = MAX_LENGTH - value.length;
  const floatingMessages = parseFloatingMessagesInput(floatingMessagesInput);
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  const applyTemplate = useCallback(
    (idx: number) => {
      const tpl = MESSAGE_TEMPLATES[idx];
      setActiveTemplate(idx);
      onChange(tpl.message);
      onLetterHeadingChange(tpl.heading);
      onLetterSignatureChange(tpl.signature);
    },
    [onChange, onLetterHeadingChange, onLetterSignatureChange],
  );

  const inputClass =
    "min-h-11 w-full rounded-[14px] border border-[rgba(96,61,77,0.2)] bg-white/80 px-4 py-2.5 text-[var(--app-text)] placeholder:text-[rgba(95,67,88,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(143,28,72,0.25)]";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-[var(--app-text)]">Nội dung lời chúc</h3>
        <p className="mt-1 text-sm text-[var(--app-text-soft)]">
          Chọn mẫu có sẵn hoặc tự viết lời chúc của riêng bạn.
        </p>
      </div>

      {/* Message template cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MESSAGE_TEMPLATES.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyTemplate(idx)}
            className={cn(
              "rounded-[14px] border px-3 py-2.5 text-left text-sm font-medium transition-all",
              activeTemplate === idx
                ? "border-[var(--app-brand)] bg-[rgba(143,28,72,0.08)] text-[var(--app-brand)]"
                : "border-[rgba(96,61,77,0.2)] bg-white/70 text-[var(--app-text)] hover:border-[var(--app-brand-strong)] hover:bg-white",
            )}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Sender / Recipient (for slug/metadata) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--app-text)]">Người gửi</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => onSenderChange(e.target.value)}
            placeholder="Tên của bạn..."
            maxLength={50}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[var(--app-text)]">Người nhận</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="Tên người nhận..."
            maxLength={50}
            className={inputClass}
          />
        </div>
      </div>

      {/* Letter heading */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--app-text)]">
          Tiêu đề thư{" "}
          <span className="font-normal text-[var(--app-text-soft)]">(tùy chọn)</span>
        </label>
        <input
          type="text"
          value={letterHeading}
          onChange={(e) => {
            setActiveTemplate(null);
            onLetterHeadingChange(e.target.value);
          }}
          placeholder="Gửi người mẹ yêu quý của con,"
          maxLength={120}
          className={inputClass}
        />
        <p className="text-xs text-[var(--app-text-soft)]">Tiêu đề sẽ hiển thị ở đầu lá thư</p>
      </div>

      {/* Main message */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--app-text)]">
          Nội dung thư <span style={{ color: "var(--app-brand)" }}>*</span>
        </label>
        <div className="relative">
          <motion.textarea
            value={value}
            onChange={(e) => {
              setActiveTemplate(null);
              if (e.target.value.length <= MAX_LENGTH) onChange(e.target.value);
            }}
            placeholder="Gửi lời chúc yêu thương nhân ngày 8/3..."
            rows={6}
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
        <p className="text-xs text-[var(--app-text-soft)]">
          Mỗi đoạn cách nhau bởi dòng trống sẽ thành đoạn riêng
        </p>
      </div>

      {/* Signature */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--app-text)]">
          Chữ ký{" "}
          <span className="font-normal text-[var(--app-text-soft)]">(tùy chọn)</span>
        </label>
        <input
          type="text"
          value={letterSignature}
          onChange={(e) => {
            setActiveTemplate(null);
            onLetterSignatureChange(e.target.value);
          }}
          placeholder="Con trai / Con gái của mẹ 💕"
          maxLength={120}
          className={inputClass}
        />
        <p className="text-xs text-[var(--app-text-soft)]">
          Chữ ký sẽ hiển thị ở cuối lá thư, căn phải và in nghiêng
        </p>
      </div>

      {/* Floating messages */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-[var(--app-text)]">
          Những câu nhắn nhỏ rơi trên màn hình
        </label>
        <p className="text-sm text-[var(--app-text-soft)]">
          Mỗi dòng là một câu ngắn. Tối đa {MAX_FLOATING_MESSAGES} câu, mỗi câu tối đa{" "}
          {MAX_FLOATING_MESSAGE_LENGTH} ký tự.
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
          <span>
            {floatingMessages.length}/{MAX_FLOATING_MESSAGES} câu
          </span>
          <span>Dòng dài hơn sẽ tự cắt ở {MAX_FLOATING_MESSAGE_LENGTH} ký tự</span>
        </div>
      </div>
    </div>
  );
}
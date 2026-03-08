import { ImageResponse } from "next/og";
import { findGiftBySlugOrId, toGiftData } from "@/lib/gift-record";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const runtime = "edge";

interface OpenGraphImageProps {
  params: Promise<{ id: string }>;
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { id } = await params;
  const giftRecord = await findGiftBySlugOrId(id);
  const gift = giftRecord ? toGiftData(giftRecord) : null;

  const title = gift?.recipientName
    ? `Quà dành cho ${gift.recipientName}`
    : "Bạn vừa nhận một món quà";
  const subtitle = gift?.senderName
    ? `${gift.senderName} gửi đến bạn`
    : "GiftCraft - Quà tặng kỹ thuật số";
  const message = gift?.message
    ? gift.message.slice(0, 120)
    : "Nhấn vào để mở quà tặng của bạn";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#fff",
          background:
            "radial-gradient(circle at 20% 20%, #f472b6 0%, transparent 50%), radial-gradient(circle at 80% 30%, #a78bfa 0%, transparent 45%), linear-gradient(135deg, #be185d, #7c3aed)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 30, opacity: 0.95 }}>GiftCraft</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 34, opacity: 0.95 }}>{subtitle}</div>
          <div style={{ fontSize: 28, opacity: 0.9, maxWidth: "940px" }}>
            {message}
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.85 }}>
          Nhấn để mở lời chúc và quà tặng
        </div>
      </div>
    ),
    size,
  );
}

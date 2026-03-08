import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontBody = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GiftCraft Atelier - Tạo quà tặng kỹ thuật số",
  description:
    "GiftCraft Atelier giúp bạn tạo quà tặng kỹ thuật số phong cách premium, chia sẻ bằng link hoặc HTML offline với motion mượt và cảnh quan đầy cảm xúc.",
  keywords: ["quà tặng", "8/3", "ngày phụ nữ", "thiệp chúc", "giftcraft"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${fontDisplay.variable} ${fontBody.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

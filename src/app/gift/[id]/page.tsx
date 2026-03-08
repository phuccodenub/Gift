import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { GiftData } from "@/types/gift";
import { findGiftBySlugOrId, toGiftData } from "@/lib/gift-record";
import { getServerBaseUrl } from "@/lib/env";
import { getShareUrl } from "@/lib/utils";
import { GiftViewer } from "./GiftViewer";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getGift(id: string): Promise<GiftData | null> {
  const gift = await findGiftBySlugOrId(id);
  if (!gift) {
    return null;
  }
  return toGiftData(gift);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const gift = await getGift(id);

  if (!gift) {
    return { title: "Quà tặng không tồn tại" };
  }

  const templateNames: Record<string, string> = {
    bouquet: "Bó Hoa",
    "greeting-card": "Thiệp Chúc Mừng",
    envelope: "Phong Bì Yêu Thương",
    "flower-tree": "Cây Hoa Huyền Diệu",
  };

  const templateName = templateNames[gift.templateId] || "Quà Tặng";
  const sharePath = gift.slug ?? gift.id ?? id;
  const shareUrl = getShareUrl(sharePath, { server: true });
  const title = gift.recipientName
    ? `${templateName} dành cho ${gift.recipientName}`
    : `${templateName} - GiftCraft`;

  const description = gift.senderName
    ? `${gift.senderName} gửi tặng bạn một món quà đặc biệt nhân ngày 8/3!`
    : "Bạn nhận được một món quà đặc biệt nhân ngày 8/3!";
  const ogImage = `${getServerBaseUrl()}/gift/${sharePath}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: shareUrl },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "GiftCraft",
      url: shareUrl,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function GiftPage({ params }: PageProps) {
  const { id } = await params;
  const gift = await getGift(id);

  if (!gift) {
    notFound();
  }

  return <GiftViewer gift={gift} />;
}

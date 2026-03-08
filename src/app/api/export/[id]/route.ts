import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/components/templates/registry";
import { imageToBase64, isAllowedAssetUrl } from "@/lib/storage";
import { findGiftBySlugOrId, toGiftData } from "@/lib/gift-record";
import { sanitizeGiftForExport } from "@/lib/export-sanitize";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const giftRecord = await findGiftBySlugOrId(id);
    if (!giftRecord) {
      return NextResponse.json(
        { error: "Không tìm thấy quà tặng" },
        { status: 404 },
      );
    }

    const template = getTemplate(giftRecord.templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Template không tồn tại" },
        { status: 400 },
      );
    }

    const giftData = toGiftData(giftRecord);
    const sanitizedGift = sanitizeGiftForExport(giftData);

    const images = await Promise.all(
      sanitizedGift.images.map(async (img) => {
        const targetUrl = img.publicUrl ?? img.url;
        if (!targetUrl || !isAllowedAssetUrl(targetUrl)) {
          throw new Error("Asset URL không hợp lệ cho export.");
        }
        const inlineUrl = await imageToBase64(targetUrl);
        return {
          ...img,
          url: inlineUrl,
          publicUrl: inlineUrl,
        };
      }),
    );

    const exportGift = {
      ...sanitizedGift,
      images,
    };

    const html = template.renderExport(exportGift);
    const htmlBytes = new TextEncoder().encode(html).byteLength;
    const MAX_EXPORT_BYTES = 10 * 1024 * 1024;
    if (htmlBytes > MAX_EXPORT_BYTES) {
      return NextResponse.json(
        { error: `File export quá lớn (${(htmlBytes / 1024 / 1024).toFixed(1)}MB). Vui lòng giảm số lượng hoặc kích thước ảnh.` },
        { status: 413 },
      );
    }
    const filenameBase = (sanitizedGift.recipientName || giftRecord.id).replace(/[^\w.-]+/g, "_");

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="gift-${filenameBase}.html"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    const message = error instanceof Error ? error.message : "Không thể xuất file";
    const status = message.includes("Asset URL") ? 400 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}

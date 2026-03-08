import { NextRequest, NextResponse } from "next/server";
import { deleteImage, uploadImage } from "@/lib/storage";
import { createUploadedAsset } from "@/lib/asset-record";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Không tìm thấy file. Vui lòng gửi trường 'file'." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận jpeg/png/webp." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Kích thước file tối đa là 2MB." },
        { status: 400 },
      );
    }

    const uploaded = await uploadImage(file);
    try {
      await createUploadedAsset({
        id: uploaded.assetId,
        provider: uploaded.provider,
        objectPath: uploaded.objectPath,
        publicUrl: uploaded.publicUrl,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes,
        expiresAt: new Date(uploaded.expiresAt),
      });
    } catch (persistError) {
      await deleteImage({
        objectPath: uploaded.objectPath,
        publicUrl: uploaded.publicUrl,
      }).catch(() => {});
      throw persistError;
    }

    return NextResponse.json(uploaded);
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Upload thất bại" },
      { status: 500 },
    );
  }
}

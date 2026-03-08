import { NextRequest, NextResponse } from "next/server";
import { createUploadedAsset } from "@/lib/asset-record";
import { deleteAsset, uploadAsset } from "@/lib/storage";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["audio/mpeg", "audio/mp3"]);

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
        { error: "Chỉ chấp nhận file MP3." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Kích thước file MP3 tối đa là 3MB." },
        { status: 400 },
      );
    }

    const uploaded = await uploadAsset(file);
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
      await deleteAsset({
        objectPath: uploaded.objectPath,
        publicUrl: uploaded.publicUrl,
      }).catch(() => {});
      throw persistError;
    }

    return NextResponse.json(uploaded);
  } catch (error) {
    console.error("POST /api/upload/audio error:", error);
    return NextResponse.json(
      { error: "Upload nhạc thất bại" },
      { status: 500 },
    );
  }
}

import { ApiError } from "@/shared/libs/api";
import { ACCEPTED_IMAGE_TYPES, MAX_EDGE, MAX_UPLOAD_BYTES, type UploadPurpose } from "./upload-rules";

// 이미지 업로드 준비 (설계 문서 4절). 브라우저에서 WebP 0.82로 변환(못 하면 JPEG 0.85) · 긴 변 상한 · GIF·SVG는 그대로.
// 파일은 각 도메인의 저장 요청(서버 액션 → Spring multipart)에 함께 보낸다.

/**
 * 올리기 전 검사 · 변환(형식 확인 → WebP 변환 · 긴 변 상한 → 10MB 확인). 실패하면 화면에 보여 줄 문구를 담은 ApiError.
 */
export async function prepareImage(file: File, purpose: UploadPurpose): Promise<File> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ApiError({ status: 400, message: "JPG, PNG, GIF, WebP, SVG 이미지만 올릴 수 있어요." });
  }
  const blob = await convertImage(file, MAX_EDGE[purpose]);
  if (blob.size > MAX_UPLOAD_BYTES) throw new ApiError({ status: 400, message: "10MB 이하 이미지만 올릴 수 있어요." });
  if (blob === file) return file;
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${extension}`, { type: blob.type });
}

/** 움직이는 GIF·벡터(SVG)는 변환하지 않는다. 나머지는 긴 변을 줄이고 WebP(안 되면 JPEG)로 바꾼다. */
async function convertImage(file: File, maxEdge: number): Promise<Blob | File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const webp = await canvas.convertToBlob({ type: "image/webp", quality: 0.82 });
  if (webp.type === "image/webp") return webp;
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}

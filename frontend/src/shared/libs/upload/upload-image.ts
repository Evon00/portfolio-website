import { ApiError, adminFetch } from "@/shared/libs/api";
import type { UploadCompleteResponse, UploadPresignResponse } from "@/shared/_controllers/_legacy-types";
import { ACCEPTED_IMAGE_TYPES, MAX_EDGE, MAX_UPLOAD_BYTES, type UploadPurpose } from "./upload-rules";

// 이미지 업로드 (설계 문서 4절). 화면은 uploadImage 하나만 부른다.
// 1) 브라우저에서 WebP 0.82로 변환(못 하면 JPEG 0.85) · 긴 변 상한 · GIF·SVG는 그대로
// 2) 업로드 주소 발급 → 3) 저장소로 직접 PUT(진행률은 XHR) → 4) 등록 확인
// 목 단계: 발급 주소가 mock://면 3)을 건너뛰고, 4)의 주소 대신 미리보기 주소(blob:)를 돌려준다(새로고침하면 사라진다).
export async function uploadImage(
  file: File,
  purpose: UploadPurpose,
  onProgress?: (percent: number) => void,
): Promise<UploadCompleteResponse> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ApiError({ status: 400, message: "JPG, PNG, GIF, WebP, SVG 이미지만 올릴 수 있어요." });
  }
  const blob = await convertImage(file, MAX_EDGE[purpose]);
  if (blob.size > MAX_UPLOAD_BYTES) throw new ApiError({ status: 400, message: "10MB 이하 이미지만 올릴 수 있어요." });

  const presign = await adminFetch<UploadPresignResponse>("/api/admin/uploads/presign", {
    json: { purpose, contentType: blob.type, size: blob.size },
  });
  const isMock = presign.uploadUrl.startsWith("mock://");
  if (isMock) onProgress?.(100);
  else await putWithProgress(presign, blob, onProgress);

  const completed = await adminFetch<UploadCompleteResponse>("/api/admin/uploads/complete", {
    json: { fileKey: presign.fileKey },
  });
  return isMock ? { ...completed, url: URL.createObjectURL(blob) } : completed;
}

/** 움직이는 GIF·벡터(SVG)는 변환하지 않는다. 나머지는 긴 변을 줄이고 WebP(안 되면 JPEG)로 바꾼다. */
async function convertImage(file: File, maxEdge: number): Promise<Blob> {
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

function putWithProgress(presign: UploadPresignResponse, blob: Blob, onProgress?: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(presign.method, presign.uploadUrl);
    for (const [key, value] of Object.entries(presign.headers)) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError({ status: xhr.status, message: "이미지를 올리지 못했어요. 다시 시도해 주세요." }));
    xhr.onerror = () => reject(new ApiError({ message: "네트워크 오류로 이미지를 올리지 못했어요." }));
    xhr.send(blob);
  });
}

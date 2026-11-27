import "server-only";

import { ApiError } from "@/shared/libs/api";
import type {
  UploadCompleteRequest,
  UploadCompleteResponse,
  UploadPresignRequest,
  UploadPresignResponse,
} from "@/shared/_generated";
import { mockDelay, nextMockId } from "./store";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/shared/libs/upload/upload-rules";

// 업로드 목 구현(서버 메모리). 인자 · 반환 모양은 upload/upload.api.ts(실제 구현)와 같다(data-source.server.ts의 satisfies가 확인한다).
// data-source.server.ts가 이 파일을 고른다. Spring 연결 때 upload/upload.api.ts로 바꾸면 이 파일은 지운다.
// 목 단계: 발급은 mock:// 주소를 돌려주고, 브라우저는 업로드를 건너뛰고 미리보기용 주소(blob:)를 쓴다.

/** POST /api/admin/uploads/presign */
export async function presignUpload(request: UploadPresignRequest): Promise<UploadPresignResponse> {
  await mockDelay();
  if (!ACCEPTED_IMAGE_TYPES.includes(request.contentType)) {
    throw new ApiError({ status: 400, message: "JPG, PNG, GIF, WebP, SVG 이미지만 올릴 수 있어요." });
  }
  if (request.size > MAX_UPLOAD_BYTES)
    throw new ApiError({ status: 400, message: "10MB 이하 이미지만 올릴 수 있어요." });
  const fileKey = `${request.purpose}/${crypto.randomUUID()}`;
  return {
    uploadUrl: `mock://uploads/${fileKey}`,
    method: "PUT",
    headers: { "Content-Type": request.contentType },
    fileKey,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  };
}

/** POST /api/admin/uploads/complete */
export async function completeUpload({ fileKey }: UploadCompleteRequest): Promise<UploadCompleteResponse> {
  await mockDelay();
  if (!fileKey) throw new ApiError({ status: 400, message: "업로드한 파일을 찾을 수 없어요." });
  return { imageId: nextMockId(), url: `mock://files/${fileKey}` };
}

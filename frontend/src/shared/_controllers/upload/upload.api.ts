import "server-only";

import type {
  UploadCompleteRequest,
  UploadCompleteResponse,
  UploadPresignRequest,
  UploadPresignResponse,
} from "@/shared/_generated";
import { adminApiClient } from "@/shared/libs/api/client";

export type CompleteUploadBody = UploadCompleteRequest;
export type CompleteUploadResponse = UploadCompleteResponse;
export type PresignUploadBody = UploadPresignRequest;
export type PresignUploadResponse = UploadPresignResponse;

export async function completeUpload(body: CompleteUploadBody) {
  return adminApiClient<CompleteUploadResponse>("/api/admin/uploads/complete", {
    method: "POST",
    body,
  });
}

export async function presignUpload(body: PresignUploadBody) {
  return adminApiClient<PresignUploadResponse>("/api/admin/uploads/presign", {
    method: "POST",
    body,
  });
}

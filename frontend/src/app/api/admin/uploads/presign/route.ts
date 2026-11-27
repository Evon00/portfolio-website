import { presignUpload } from "@/shared/_controllers/upload/index.server";
import { ApiError } from "@/shared/libs/api";
import type { UploadPresignRequest } from "@/shared/_controllers/_legacy-types";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const POST = withAdminRoute(async (request) => {
  const body = (await request.json().catch(() => null)) as UploadPresignRequest | null;
  if (!body) throw new ApiError({ status: 400, message: "요청 형식이 올바르지 않아요." });
  return presignUpload(body);
});

import { completeUpload } from "@/shared/_controllers/upload/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const POST = withAdminRoute(async (request) => {
  const body = (await request.json().catch(() => null)) as { fileKey?: string } | null;
  return completeUpload({ fileKey: body?.fileKey ?? "" });
});

import { isPostSlugAvailable } from "@/shared/_controllers/post/index.server";
import { isProjectSlugAvailable } from "@/shared/_controllers/project/index.server";
import { ApiError } from "@/shared/libs/api";
import type { SlugCheckResponse } from "@/shared/_controllers/_legacy-types";
import { withAdminRoute } from "@/shared/libs/auth/guard";

// GET /api/admin/slug-check?type=post|project&slug=
export const GET = withAdminRoute(async (request): Promise<SlugCheckResponse> => {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const type = searchParams.get("type");
  if (!slug || (type !== "post" && type !== "project")) {
    throw new ApiError({ status: 400, message: "슬러그와 종류를 확인해 주세요." });
  }
  return type === "post" ? isPostSlugAvailable({ slug }) : isProjectSlugAvailable({ slug });
});

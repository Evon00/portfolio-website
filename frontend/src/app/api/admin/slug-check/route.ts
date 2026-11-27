import { checkPostSlug } from "@/shared/_controllers/post/index.server";
import { isProjectSlugAvailable } from "@/shared/_controllers/project/index.server";
import { ApiError } from "@/shared/libs/api";
import { withAdminRoute } from "@/shared/libs/auth/guard";

// GET /api/admin/slug-check?type=post|project&slug= → { available }
export const GET = withAdminRoute(async (request): Promise<{ available: boolean }> => {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const type = searchParams.get("type");
  if (!slug || (type !== "post" && type !== "project")) {
    throw new ApiError({ status: 400, message: "슬러그와 종류를 확인해 주세요." });
  }
  if (type === "post") return { available: (await checkPostSlug({ postSlug: slug })).available };
  return isProjectSlugAvailable({ slug });
});

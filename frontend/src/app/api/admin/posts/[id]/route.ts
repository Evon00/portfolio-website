import { findPost } from "@/shared/_controllers/post/index.server";
import { toPostEditView } from "@/shared/_controllers/post";
import { withAdminRoute } from "@/shared/libs/auth/guard";
import { parseId } from "@/app/api/admin/parse-id";

export const GET = withAdminRoute(async (_request, { params }: RouteContext<"/api/admin/posts/[id]">) =>
  toPostEditView(await findPost({ postId: parseId((await params).id) })),
);

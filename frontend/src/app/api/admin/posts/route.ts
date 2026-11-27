import { findAllAdminPosts } from "@/shared/_controllers/post/index.server";
import {
  ADMIN_POST_PAGE_SIZE,
  readPostListFilters,
  toPostListQuery,
  toPostPage,
  toPostRowView,
} from "@/shared/_controllers/post";
import { withAdminRoute } from "@/shared/libs/auth/guard";

// GET /api/admin/posts?q=&scope=&sort=&page= (한 쪽 ADMIN_POST_PAGE_SIZE개)

export const GET = withAdminRoute(async (request) => {
  const filters = readPostListFilters(new URL(request.url).searchParams, ADMIN_POST_PAGE_SIZE);
  return toPostPage(await findAllAdminPosts(toPostListQuery(filters)), toPostRowView);
});

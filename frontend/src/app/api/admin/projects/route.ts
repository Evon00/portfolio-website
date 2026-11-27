import { findAllAdminProjects } from "@/shared/_controllers/project/index.server";
import { PROJECT_LIST_SIZE, toProjectRowView } from "@/shared/_controllers/project";
import { withAdminRoute } from "@/shared/libs/auth/guard";

// 어드민 목록은 순서 창이 전체 순서를 다뤄야 해서 한 번에 받고, 표의 페이지는 화면에서 나눈다.
export const GET = withAdminRoute(async () => {
  const page = await findAllAdminProjects({ pageNumber: 0, pageSize: PROJECT_LIST_SIZE });
  return page.content.map(toProjectRowView);
});

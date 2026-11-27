import { getProjectById } from "@/shared/_controllers/project/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";
import { parseId } from "@/app/api/admin/parse-id";

export const GET = withAdminRoute(async (_request, { params }: RouteContext<"/api/admin/projects/[id]">) =>
  getProjectById({ projectId: parseId((await params).id) }),
);

import { findProject } from "@/shared/_controllers/project/index.server";
import { toProjectEditView } from "@/shared/_controllers/project";
import { withAdminRoute } from "@/shared/libs/auth/guard";
import { parseId } from "@/app/api/admin/parse-id";

export const GET = withAdminRoute(async (_request, { params }: RouteContext<"/api/admin/projects/[id]">) =>
  toProjectEditView(await findProject({ projectId: parseId((await params).id) })),
);

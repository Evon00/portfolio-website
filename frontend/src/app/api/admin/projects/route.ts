import { getProjectSummaries } from "@/shared/_controllers/project/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const GET = withAdminRoute(() => getProjectSummaries());

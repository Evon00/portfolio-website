import { getDashboard } from "@/shared/_controllers/dashboard/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const GET = withAdminRoute(() => getDashboard());

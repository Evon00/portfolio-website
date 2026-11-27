import { getPostSummaries } from "@/shared/_controllers/post/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const GET = withAdminRoute(() => getPostSummaries());

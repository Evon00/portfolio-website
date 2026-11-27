import { getProfile } from "@/shared/_controllers/profile/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const GET = withAdminRoute(() => getProfile());

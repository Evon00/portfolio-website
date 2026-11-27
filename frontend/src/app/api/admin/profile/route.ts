import { findProfile } from "@/shared/_controllers/profile/index.server";
import { toProfileView } from "@/shared/_controllers/profile";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const GET = withAdminRoute(async () => toProfileView(await findProfile()));

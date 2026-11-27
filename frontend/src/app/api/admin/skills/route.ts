import { getSkills } from "@/shared/_controllers/skill/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

export const GET = withAdminRoute(() => getSkills());

import { findAllSkills } from "@/shared/_controllers/skill/index.server";
import { toSkillView } from "@/shared/_controllers/skill";
import { withAdminRoute } from "@/shared/libs/auth/guard";

// 기술 스택 전체(최근 등록순). 카테고리 · 이름 검색은 화면에서 거른다.
export const GET = withAdminRoute(async () => (await findAllSkills()).skills.map(toSkillView));

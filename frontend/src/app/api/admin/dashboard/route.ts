import { DASHBOARD_TOP_COUNT, toDashboardView } from "@/shared/_controllers/stats";
import { findPopularPosts, findSkillStats, findStatsSummary } from "@/shared/_controllers/stats/index.server";
import { withAdminRoute } from "@/shared/libs/auth/guard";

// 대시보드는 Spring 통계 API 4개를 함께 불러 한 응답으로 준다. 하나라도 실패하면 대시보드 전체가 오류 화면이다.
export const GET = withAdminRoute(async () => {
  const [summary, popular, postSkills, projectSkills] = await Promise.all([
    findStatsSummary(),
    findPopularPosts({ limit: DASHBOARD_TOP_COUNT }),
    findSkillStats({ type: "POST", limit: DASHBOARD_TOP_COUNT }),
    findSkillStats({ type: "PROJECT", limit: DASHBOARD_TOP_COUNT }),
  ]);
  return toDashboardView(summary, popular, postSkills, projectSkills);
});

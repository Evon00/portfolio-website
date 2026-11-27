import "server-only";

import { stats } from "@/shared/_controllers/data-source.server";

// 통계(대시보드) 데이터 접근 창구. 대시보드 Route Handler는 이 함수들만 쓴다.
// 실제 구현은 data-source.server.ts가 고른다(stats.api.ts).

/** 요약 4칸(게시글·프로젝트 수, 총·평균 조회수). GET /api/admin/stats/summary */
export const findStatsSummary = stats.findStatsSummary;

/** 조회수 상위 게시글. GET /api/admin/stats/post/popular?limit= */
export const findPopularPosts = stats.findPopularPosts;

/** 기술 스택 비율(상위 + 기타). GET /api/admin/stats/skill?type=POST|PROJECT&limit= */
export const findSkillStats = stats.findSkillStats;

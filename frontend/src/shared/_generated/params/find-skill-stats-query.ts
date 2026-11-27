/**
 * @description
 * Auto-generated API parameters from backend OpenAPI paths.
 * Do not edit manually.
 */
export type FindSkillStatsQuery = {
  /** 집계 대상 (블로그 / 프로젝트) */
  type: "POST" | "PROJECT";
  /** 상위 개수 (1~20, 기본 5, 나머지는 기타) */
  limit?: number;
};

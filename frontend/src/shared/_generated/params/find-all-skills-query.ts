/**
 * @description
 * Auto-generated API parameters from backend OpenAPI paths.
 * Do not edit manually.
 */
export type FindAllSkillsQuery = {
  /** 카테고리 필터 (정확히 일치, 없으면 전체) */
  skillCategory?: string;
  /** 이름 검색어 (부분 일치, 대소문자 무시) */
  keyword?: string;
};

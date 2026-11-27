/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface SkillStatsItem {
  /** 기술 스택 PK */
  skillId: number;
  /** 기술 스택 이름 */
  skillName: string;
  /** 사용 수 */
  count: number;
  /** 비율 (정수 퍼센트) */
  ratio: number;
}

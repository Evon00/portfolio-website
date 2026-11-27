/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindProfileItem {
  /** 기술 스택 PK */
  skillId: number;
  /** 기술 스택 이름 */
  skillName: string;
  /** 기술 스택 카테고리 */
  skillCategory: string;
  /** 기술 스택 아이콘 URL */
  skillUrl: string | null;
  /** 핵심 기술 스택 순서 (1부터) */
  adminSkillPriority: number;
}

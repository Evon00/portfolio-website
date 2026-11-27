/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CreateSkillResponseDto {
  /** 기술 스택 PK */
  skillId: number;
  /** 기술 스택 이름 */
  skillName: string;
  /** 기술 스택 카테고리 */
  skillCategory: string;
  /** 기술 스택 아이콘 URL */
  skillUrl: string | null;
  /** 생성일 */
  createdAt: string;
}

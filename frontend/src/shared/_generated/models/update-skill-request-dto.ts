/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdateSkillRequestDto {
  /** 기술 스택 이름 (보내지 않으면 기존 값 유지) */
  skillName?: string;
  /** 기술 스택 카테고리 (보내지 않으면 기존 값 유지) */
  skillCategory?: string;
  /** 아이콘 삭제 여부 (true면 아이콘 삭제, 보내지 않거나 false면 유지, file과 함께 보낼 수 없음) */
  deleteIcon?: boolean;
}

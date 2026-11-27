/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface SkillResponse {
  /** 기술 스택 ID */
  skillId: number;
  /** 이름 */
  name: string;
  /** 분류 */
  category: "FRONTEND" | "BACKEND" | "DATABASE" | "DEVOPS" | "TOOLS";
  /** 아이콘 이미지 주소 */
  iconUrl: string | null;
  /** 등록 시각 */
  createdAt: string;
}

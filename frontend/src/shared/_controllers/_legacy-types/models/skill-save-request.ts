/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface SkillSaveRequest {
  /** 이름 */
  name: string;
  /** 분류 */
  category: "FRONTEND" | "BACKEND" | "DATABASE" | "DEVOPS" | "TOOLS";
  /** 업로드 완료 응답의 이미지 ID. 아이콘이 없으면 null */
  iconImageId: number | null;
  /** 아이콘 주소(목 단계 표시용. Spring은 iconImageId로 찾는다) */
  iconUrl: string | null;
}

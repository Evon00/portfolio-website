/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface PostSaveRequest {
  /** 제목 */
  title: string;
  /** 슬러그. 수정 때는 바꿀 수 없다 */
  slug: string;
  /** 요약 */
  summary: string;
  /** 본문(마크다운) */
  content: string;
  /** 기술 스택 ID */
  skillIds: number[];
}

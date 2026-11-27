/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CheckPostSlugResponseDto {
  /** 확인한 슬러그 */
  postSlug: string;
  /** 사용 가능 여부 (같은 슬러그의 게시글이 없으면 true) */
  available: boolean;
}

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CheckProjectSlugResponseDto {
  /** 확인한 슬러그 */
  projectSlug: string;
  /** 사용 가능 여부 (같은 슬러그의 프로젝트가 없으면 true) */
  available: boolean;
}

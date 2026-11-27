/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindProjectBySlugMediaItem {
  /** 프로젝트 이미지 PK */
  projectMediaId: number;
  /** 프로젝트 이미지 URL */
  projectMediaUrl: string;
  /** 이미지 설명 (altText, 없으면 null) */
  projectMediaCaption: string | null;
  /** 대표 이미지 여부 */
  projectMediaIsImportant: boolean;
  /** 이미지 순서 (오름차순 정렬) */
  projectMediaPriority: number;
}

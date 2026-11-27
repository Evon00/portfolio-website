/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindPostMediaItem {
  /** 게시글 이미지 PK */
  postMediaId: number;
  /** 게시글 이미지 URL */
  postMediaUrl: string;
  /** 이미지 캡션 (없으면 null) */
  postMediaCaption: string | null;
}

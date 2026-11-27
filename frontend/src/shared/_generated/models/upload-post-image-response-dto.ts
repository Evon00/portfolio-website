/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UploadPostImageResponseDto {
  /** 게시글 미디어 PK (게시글 추가/수정시 postMediaIds로 전달) */
  postMediaId: number;
  /** 게시글 이미지 URL (본문 마크다운에 삽입) */
  postMediaUrl: string;
}

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CreatePostRequestDto {
  /** 게시글 제목 */
  postTitle: string;
  /** 게시글 슬러그 (영문 소문자, 숫자, 하이픈 / 등록 후 변경 불가) */
  postSlug: string;
  /** 게시글 요약 */
  postSummary: string;
  /** 게시글 본문 (마크다운) */
  postContent: string;
  /** 기술 스택 PK 목록 (배열 순서 = 태그 노출 순서) */
  skillIds: number[];
  /** 게시글 이미지 PK 목록 (이미지 업로드 API로 받은 postMediaId) */
  postMediaIds?: number[];
}

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdatePostRequestDto {
  /** 게시글 제목 (보내지 않으면 기존 값 유지) */
  postTitle?: string;
  /** 게시글 요약 (보내지 않으면 기존 값 유지) */
  postSummary?: string;
  /** 게시글 본문 (마크다운, 보내지 않으면 기존 값 유지) */
  postContent?: string;
  /** 기술 스택 PK 목록 (보내면 전체 교체, 배열 순서 = 태그 노출 순서, 보내지 않으면 기존 값 유지) */
  skillIds?: number[];
  /** 본문에 남아 있는 게시글 이미지 PK 전체 (기존 + 신규, 보내지 않으면 기존 연결 유지, 빈 배열이면 모두 해제) */
  postMediaIds?: number[];
}

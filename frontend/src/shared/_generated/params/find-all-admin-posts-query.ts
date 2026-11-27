/**
 * @description
 * Auto-generated API parameters from backend OpenAPI paths.
 * Do not edit manually.
 */
export type FindAllAdminPostsQuery = {
  /** 페이지 번호 (0부터, 기본 0) */
  pageNumber?: number;
  /** 페이지 크기 (1~50, 기본 10) */
  pageSize?: number;
  /** 정렬 기준 (createdAt : 등록일, postView : 조회수, 기본 createdAt) */
  sortBy?: "createdAt" | "postView";
  /** 정렬 방향 (기본 desc) */
  sortDir?: "asc" | "desc";
  /** 검색 종류 (제목, 내용, 제목+내용, 기술 스택명 / 검색어만 있으면 TITLE_CONTENT) */
  keywordType?: "TITLE" | "CONTENT" | "TITLE_CONTENT" | "SKILL";
  /** 검색어 (부분 일치, 대소문자 무시) */
  keyword?: string;
};

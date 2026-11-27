/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface PopularPostItem {
  /** 순위 (1부터, 동점도 다른 순위) */
  rank: number;
  /** 게시글 PK */
  postId: number;
  /** 게시글 제목 */
  postTitle: string;
  /** 게시글 슬러그 */
  postSlug: string;
  /** 조회수 */
  postView: number;
}

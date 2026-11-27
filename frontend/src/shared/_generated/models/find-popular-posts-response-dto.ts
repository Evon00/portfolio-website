import type { PopularPostItem } from "./popular-post-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindPopularPostsResponseDto {
  /** 인기 게시글 (조회수 내림차순) */
  posts: PopularPostItem[];
}

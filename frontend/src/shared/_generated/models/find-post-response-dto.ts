import type { FindPostMediaItem } from "./find-post-media-item";
import type { PostSkillItem } from "./post-skill-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindPostResponseDto {
  /** 게시글 PK */
  postId: number;
  /** 게시글 제목 */
  postTitle: string;
  /** 게시글 슬러그 */
  postSlug: string;
  /** 게시글 요약 */
  postSummary: string;
  /** 게시글 본문 (마크다운 원문) */
  postContent: string;
  /** 기술 스택 (postSkillPriority 오름차순) */
  skills: PostSkillItem[];
  /** 게시글에 연결된 이미지 (업로드 순서) */
  postMedias: FindPostMediaItem[];
}

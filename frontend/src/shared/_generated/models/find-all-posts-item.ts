import type { PostSkillItem } from "./post-skill-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindAllPostsItem {
  /** 게시글 PK */
  postId: number;
  /** 게시글 제목 */
  postTitle: string;
  /** 게시글 요약 */
  postSummary: string;
  /** 게시글 슬러그 */
  postSlug: string;
  /** 썸네일 URL (본문 첫 번째 업로드 이미지, 없으면 null) */
  postThumbnailUrl: string | null;
  /** 조회수 */
  postView: number;
  /** 등록일 */
  createdAt: string;
  /** 기술 스택 (postSkillPriority 오름차순) */
  skills: PostSkillItem[];
}

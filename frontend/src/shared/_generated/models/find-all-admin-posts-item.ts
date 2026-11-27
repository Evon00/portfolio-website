import type { PostSkillItem } from "./post-skill-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindAllAdminPostsItem {
  /** 게시글 PK */
  postId: number;
  /** 게시글 제목 */
  postTitle: string;
  /** 게시글 슬러그 */
  postSlug: string;
  /** 조회수 */
  postView: number;
  /** 본문 수정일 (수정 전이면 null) */
  postModifiedAt: string | null;
  /** 등록일 */
  createdAt: string;
  /** 기술 스택 (postSkillPriority 오름차순) */
  skills: PostSkillItem[];
}

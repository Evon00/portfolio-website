import type { PostSkillItem } from "./post-skill-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindPostBySlugResponseDto {
  /** 게시글 PK */
  postId: number;
  /** 게시글 제목 */
  postTitle: string;
  /** 게시글 요약 */
  postSummary: string;
  /** 게시글 본문 (마크다운 원문) */
  postContent: string;
  /** 게시글 슬러그 */
  postSlug: string;
  /** 썸네일 URL (본문 첫 번째 업로드 이미지, 없으면 null) */
  postThumbnailUrl: string | null;
  /** 조회수 (이번 조회 반영) */
  postView: number;
  /** 본문 수정일 (수정 전이면 null) */
  postModifiedAt: string | null;
  /** 등록일 */
  createdAt: string;
  /** 기술 스택 (postSkillPriority 오름차순) */
  skills: PostSkillItem[];
}

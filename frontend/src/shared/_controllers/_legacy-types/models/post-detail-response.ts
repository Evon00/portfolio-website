import type { SkillResponse } from "./skill-response";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface PostDetailResponse {
  /** 게시글 ID */
  postId: number;
  /** 슬러그 */
  slug: string;
  /** 제목 */
  title: string;
  /** 요약 */
  summary: string;
  /** 썸네일(본문 첫 이미지) 주소 */
  thumbnailUrl: string | null;
  /** 조회 수 */
  viewCount: number;
  /** 발행 시각 */
  publishedAt: string;
  /** 수정 시각 */
  updatedAt: string;
  /** 본문(마크다운) */
  content: string;
  /** 기술 스택 */
  skills: SkillResponse[];
}

import type { DashboardPopularPost } from "./dashboard-popular-post";
import type { DashboardSkillShare } from "./dashboard-skill-share";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface DashboardResponse {
  /** 총 게시글 */
  totalPosts: number;
  /** 총 프로젝트 */
  totalProjects: number;
  /** 총 조회수 */
  totalViews: number;
  /** 글당 평균 조회수 */
  avgViews: number;
  /** 조회수 상위 5개 게시글 */
  popularPosts: DashboardPopularPost[];
  /** 게시글에 태그된 기술 스택 (많은 순) */
  postSkills: DashboardSkillShare[];
  /** 프로젝트에 쓴 기술 스택 (많은 순) */
  projectSkills: DashboardSkillShare[];
}

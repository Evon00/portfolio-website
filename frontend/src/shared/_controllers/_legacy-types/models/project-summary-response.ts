import type { SkillResponse } from "./skill-response";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface ProjectSummaryResponse {
  /** 프로젝트 ID */
  projectId: number;
  /** 슬러그 */
  slug: string;
  /** 제목 */
  title: string;
  /** 요약 */
  summary: string;
  /** 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 종료일 (YYYY-MM-DD). 진행 중이면 null */
  endDate: string | null;
  /** 대표 이미지 주소 */
  thumbnailUrl: string | null;
  /** GitHub 주소 */
  githubUrl: string | null;
  /** 사이트 주소 */
  demoUrl: string | null;
  /** 비공개 레포지토리 여부 */
  repoPrivate: boolean;
  /** 메인 주요 프로젝트 여부 */
  featured: boolean;
  /** 갤러리 이미지 수 */
  imageCount: number;
  /** 기술 스택 */
  skills: SkillResponse[];
}

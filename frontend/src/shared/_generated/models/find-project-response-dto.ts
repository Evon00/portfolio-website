import type { FindProjectMediaItem } from "./find-project-media-item";
import type { ProjectSkillItem } from "./project-skill-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindProjectResponseDto {
  /** 프로젝트 PK */
  projectId: number;
  /** 프로젝트 제목 */
  projectTitle: string;
  /** 프로젝트 슬러그 */
  projectSlug: string;
  /** 프로젝트 요약 */
  projectSummary: string;
  /** 프로젝트 본문 (마크다운 원문) */
  projectContent: string;
  /** 프로젝트 시작일 */
  projectStartDate: string;
  /** 프로젝트 종료일 (진행 중이면 null) */
  projectEndDate: string | null;
  /** GitHub 주소 (없으면 null) */
  projectGithubUrl: string | null;
  /** GitHub 레포지토리 공개 여부 */
  projectGithubIsPublic: boolean;
  /** 사이트 주소 (없으면 null) */
  projectUrl: string | null;
  /** 기술 스택 (projectSkillPriority 오름차순) */
  skills: ProjectSkillItem[];
  /** 갤러리 이미지 (projectMediaPriority 오름차순) */
  projectMedias: FindProjectMediaItem[];
}

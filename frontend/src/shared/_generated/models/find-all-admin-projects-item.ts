import type { ProjectSkillItem } from "./project-skill-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindAllAdminProjectsItem {
  /** 프로젝트 PK */
  projectId: number;
  /** 프로젝트 제목 */
  projectTitle: string;
  /** 프로젝트 슬러그 */
  projectSlug: string;
  /** 프로젝트 시작일 */
  projectStartDate: string;
  /** 프로젝트 종료일 (진행 중이면 null) */
  projectEndDate: string | null;
  /** 프로젝트 순서 (오름차순 정렬) */
  projectPriority: number;
  /** 갤러리 이미지 수 (0이면 없음) */
  projectMediaCount: number;
  /** 기술 스택 (projectSkillPriority 오름차순) */
  skills: ProjectSkillItem[];
}

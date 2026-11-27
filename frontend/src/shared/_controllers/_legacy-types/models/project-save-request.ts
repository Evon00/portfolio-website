import type { ProjectImageRequest } from "./project-image-request";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface ProjectSaveRequest {
  /** 제목 */
  title: string;
  /** 슬러그. 수정 때는 바꿀 수 없다 */
  slug: string;
  /** 요약 */
  summary: string;
  /** 본문(마크다운) */
  content: string;
  /** 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** 종료일 (YYYY-MM-DD). 진행 중이면 null */
  endDate: string | null;
  /** GitHub 주소 */
  githubUrl: string | null;
  /** 사이트 주소 */
  demoUrl: string | null;
  /** 비공개 레포지토리 여부 */
  repoPrivate: boolean;
  /** 기술 스택 ID */
  skillIds: number[];
  /** 갤러리 이미지(순서대로, 첫 장이 대표) */
  images: ProjectImageRequest[];
}

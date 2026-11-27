import type { UpdateProjectMediaItem } from "./update-project-media-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdateProjectRequestDto {
  /** 프로젝트 제목 (보내지 않으면 기존 값 유지) */
  projectTitle?: string;
  /** 프로젝트 요약 (보내지 않으면 기존 값 유지) */
  projectSummary?: string;
  /** 프로젝트 본문 (마크다운, 보내지 않으면 기존 값 유지) */
  projectContent?: string;
  /** 프로젝트 시작일 (YYYY-MM-DD, 보내지 않으면 기존 값 유지) */
  projectStartDate?: string;
  /** 프로젝트 종료일 (YYYY-MM-DD, 보내지 않으면 기존 값 유지, 빈 문자열이면 지움 = 진행 중) */
  projectEndDate?: string;
  /** GitHub 주소 (http(s)://, 보내지 않으면 기존 값 유지, 빈 문자열이면 지움) */
  projectGithubUrl?: string;
  /** GitHub 레포지토리 공개 여부 (보내지 않으면 기존 값 유지) */
  projectGithubIsPublic?: boolean;
  /** 사이트 주소 (http(s)://, 보내지 않으면 기존 값 유지, 빈 문자열이면 지움) */
  projectUrl?: string;
  /** 기술 스택 PK 목록 (보내면 전체 교체, 배열 순서 = 태그 노출 순서, 보내지 않으면 기존 값 유지) */
  skillIds?: number[];
  /** 수정 후 최종 갤러리 전체 (배열 순서 = 이미지 노출 순서, 보내지 않으면 기존 이미지 유지, 빈 배열이면 전체 삭제) */
  projectMedias?: UpdateProjectMediaItem[];
}

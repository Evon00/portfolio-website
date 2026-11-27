import type { CreateProjectMediaItem } from "./create-project-media-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CreateProjectRequestDto {
  /** 프로젝트 제목 */
  projectTitle: string;
  /** 프로젝트 슬러그 (영문 소문자, 숫자, 하이픈 / 등록 후 변경 불가) */
  projectSlug: string;
  /** 프로젝트 요약 */
  projectSummary: string;
  /** 프로젝트 본문 (마크다운) */
  projectContent: string;
  /** 프로젝트 시작일 (YYYY-MM-DD) */
  projectStartDate: string;
  /** 프로젝트 종료일 (YYYY-MM-DD, 진행 중이면 null, 시작일 이후) */
  projectEndDate?: string;
  /** GitHub 주소 (http(s)://, 최대 300자) */
  projectGithubUrl?: string;
  /** GitHub 레포지토리 공개 여부 (기본 false) */
  projectGithubIsPublic?: boolean;
  /** 사이트 주소 (http(s)://, 최대 300자) */
  projectUrl?: string;
  /** 기술 스택 PK 목록 (배열 순서 = 태그 노출 순서) */
  skillIds: number[];
  /** 갤러리 이미지 정보 (배열 순서 = 이미지 노출 순서, files의 모든 파일이 한 번씩 포함되어야 함) */
  projectMedias?: CreateProjectMediaItem[];
}

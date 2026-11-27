import type { FindProfileItem } from "./find-profile-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindProfileResponseDto {
  /** 관리자 이름 */
  adminName: string;
  /** 관리자 소개 */
  adminDescription: string;
  /** GitHub 주소 (없으면 null) */
  adminGithubUrl: string | null;
  /** 이메일 (없으면 null) */
  adminEmail: string | null;
  /** 프로필 이미지 URL (없으면 null) */
  adminProfileUrl: string | null;
  /** 핵심 기술 스택 (adminSkillPriority 오름차순) */
  skills: FindProfileItem[];
}

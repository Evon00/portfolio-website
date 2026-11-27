/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdateProfileRequestDto {
  /** 관리자 이름 (보내지 않으면 기존 값 유지) */
  adminName?: string;
  /** 관리자 소개 (보내지 않으면 기존 값 유지) */
  adminDescription?: string;
  /** GitHub 주소 (보내지 않으면 기존 값 유지, 빈 문자열이면 값 비움) */
  adminGithubUrl?: string;
  /** 이메일 (보내지 않으면 기존 값 유지, 빈 문자열이면 값 비움) */
  adminEmail?: string;
}

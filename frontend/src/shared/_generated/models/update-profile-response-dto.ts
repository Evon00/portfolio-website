/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdateProfileResponseDto {
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
}

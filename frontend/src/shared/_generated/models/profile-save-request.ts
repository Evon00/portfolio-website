/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface ProfileSaveRequest {
  /** 이름 */
  name: string;
  /** 소개 문구 */
  intro: string;
  /** GitHub 주소 */
  githubUrl: string;
  /** 이메일 */
  email: string;
  /** 프로필 이미지 주소 */
  avatarUrl: string | null;
  /** 히어로 CORE STACK (순서대로) */
  coreSkillIds: number[];
}

import type { SkillResponse } from "./skill-response";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface ProfileResponse {
  /** 이름 */
  name: string;
  /** 직무 (히어로 eyebrow) */
  role: string;
  /** 소개 문구 */
  intro: string;
  /** 이메일 */
  email: string;
  /** GitHub 주소 */
  githubUrl: string;
  /** 프로필 이미지 주소. 지금 공개 화면에서는 쓰지 않는다 */
  avatarUrl: string | null;
  /** 히어로 CORE STACK */
  coreSkills: SkillResponse[];
}

import type { FindProfileItem } from "./find-profile-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdateProfileSkillsResponseDto {
  /** 핵심 기술 스택 (adminSkillPriority 오름차순) */
  skills: FindProfileItem[];
}

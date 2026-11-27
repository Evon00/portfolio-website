import type { FindAllSkillsItem } from "./find-all-skills-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindAllSkillsResponseDto {
  /** 조회된 기술 스택 수 */
  totalCount: number;
  /** 기술 스택 목록 (등록일 내림차순) */
  skills: FindAllSkillsItem[];
}

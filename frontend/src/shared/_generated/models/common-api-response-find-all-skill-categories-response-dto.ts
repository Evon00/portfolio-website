import type { FindAllSkillCategoriesResponseDto } from "./find-all-skill-categories-response-dto";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CommonApiResponseFindAllSkillCategoriesResponseDto {
  /** 성공 여부 */
  isSuccess: boolean;
  /** 응답 메시지 */
  message: string;
  /** 응답 데이터 */
  data: FindAllSkillCategoriesResponseDto;
}

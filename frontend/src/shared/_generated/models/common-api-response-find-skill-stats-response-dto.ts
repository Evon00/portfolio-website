import type { FindSkillStatsResponseDto } from "./find-skill-stats-response-dto";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CommonApiResponseFindSkillStatsResponseDto {
  /** 성공 여부 */
  isSuccess: boolean;
  /** 응답 메시지 */
  message: string;
  /** 응답 데이터 */
  data: FindSkillStatsResponseDto;
}

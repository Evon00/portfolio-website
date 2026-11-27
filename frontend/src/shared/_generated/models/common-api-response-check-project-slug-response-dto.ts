import type { CheckProjectSlugResponseDto } from "./check-project-slug-response-dto";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CommonApiResponseCheckProjectSlugResponseDto {
  /** 성공 여부 */
  isSuccess: boolean;
  /** 응답 메시지 */
  message: string;
  /** 응답 데이터 */
  data: CheckProjectSlugResponseDto;
}

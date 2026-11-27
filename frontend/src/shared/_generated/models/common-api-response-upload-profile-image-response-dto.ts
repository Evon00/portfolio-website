import type { UploadProfileImageResponseDto } from "./upload-profile-image-response-dto";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CommonApiResponseUploadProfileImageResponseDto {
  /** 성공 여부 */
  isSuccess: boolean;
  /** 응답 메시지 */
  message: string;
  /** 응답 데이터 */
  data: UploadProfileImageResponseDto;
}

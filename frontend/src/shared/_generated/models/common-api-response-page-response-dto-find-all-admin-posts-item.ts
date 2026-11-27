import type { PageResponseDtoFindAllAdminPostsItem } from "./page-response-dto-find-all-admin-posts-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CommonApiResponsePageResponseDtoFindAllAdminPostsItem {
  /** 성공 여부 */
  isSuccess: boolean;
  /** 응답 메시지 */
  message: string;
  /** 응답 데이터 */
  data: PageResponseDtoFindAllAdminPostsItem;
}

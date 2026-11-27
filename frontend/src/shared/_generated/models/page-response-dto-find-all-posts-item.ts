import type { FindAllPostsItem } from "./find-all-posts-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface PageResponseDtoFindAllPostsItem {
  /** 현재 페이지 번호 (0부터 시작) */
  pageNumber: number;
  /** 현재 페이지 크기 */
  pageSize: number;
  /** 현재 페이지가 첫번째인지 여부 */
  isFirst: boolean;
  /** 현재 페이지가 마지막인지 여부 */
  isLast: boolean;
  /** 총 페이지 수 */
  totalPages: number;
  /** 총 데이터 수 */
  totalElements: number;
  /** List 형태의 데이터 */
  content: FindAllPostsItem[];
}

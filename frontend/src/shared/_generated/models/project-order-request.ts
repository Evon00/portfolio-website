import type { ProjectOrderItem } from "./project-order-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface ProjectOrderRequest {
  /** 노출 순서대로 나열한 프로젝트 (displayOrder) */
  items: ProjectOrderItem[];
}

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindStatsSummaryResponseDto {
  /** 전체 게시글 수 (삭제 제외) */
  totalPosts: number;
  /** 전체 프로젝트 수 (삭제 제외) */
  totalProjects: number;
  /** 전체 조회수 (삭제된 게시글 제외) */
  totalViews: number;
  /** 게시글당 평균 조회수 (반올림, 게시글이 없으면 0) */
  avgViews: number;
}

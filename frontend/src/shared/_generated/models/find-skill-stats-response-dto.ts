import type { SkillStatsEtcItem } from "./skill-stats-etc-item";
import type { SkillStatsItem } from "./skill-stats-item";

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface FindSkillStatsResponseDto {
  /** 집계 대상 */
  type: string;
  /** 전체 태그 수 (도넛 가운데 숫자) */
  totalCount: number;
  /** 상위 기술 스택 (사용 수 내림차순) */
  items: SkillStatsItem[];
  /** 기타 (나머지가 없으면 count 0, ratio 0) */
  etc: SkillStatsEtcItem;
}

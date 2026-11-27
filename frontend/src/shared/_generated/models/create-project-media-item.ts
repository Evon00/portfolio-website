/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface CreateProjectMediaItem {
  /** files 파트의 인덱스 (0부터) */
  fileIndex: number;
  /** 이미지 설명 (최대 50자, 빈 값이면 null) */
  projectMediaCaption?: string;
  /** 대표 이미지 여부 (최대 1개, 기본 false) */
  projectMediaIsImportant?: boolean;
}

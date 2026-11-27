/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UpdateProjectMediaItem {
  /** 기존 이미지 PK (새 이미지면 null) */
  projectMediaId?: number;
  /** 새 이미지의 files 파트 인덱스 (0부터, 기존 이미지면 null) */
  fileIndex?: number;
  /** 이미지 설명 (최대 50자, null 또는 빈 값이면 설명 없음) */
  projectMediaCaption?: string;
  /** 대표 이미지 여부 (최대 1개, null이면 false) */
  projectMediaIsImportant?: boolean;
}

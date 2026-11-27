/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface ProjectImageRequest {
  /** 업로드 완료 응답의 이미지 ID */
  imageId: number;
  /** 이미지 주소(목 단계 표시용. Spring은 imageId로 찾는다) */
  url: string;
  /** 이미지 설명. 비우면 캡션을 숨긴다 */
  caption: string | null;
}

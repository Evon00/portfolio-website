/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UploadPresignRequest {
  /** 용도 */
  purpose: "post" | "project" | "skill" | "profile";
  /** 변환 후 파일 형식 */
  contentType: string;
  /** 바이트 크기 */
  size: number;
}

/**
 * @description
 * Auto-generated DTO from backend OpenAPI schema.
 * Do not edit manually.
 */
export interface UploadPresignResponse {
  /** 저장소 업로드 주소 */
  uploadUrl: string;
  /** 업로드 메서드 */
  method: "PUT";
  /** 업로드 때 함께 보낼 헤더 */
  headers: Record<string, string>;
  /** 등록 확인에 쓰는 파일 키 */
  fileKey: string;
  /** 업로드 주소 만료 시각 */
  expiresAt: string;
}

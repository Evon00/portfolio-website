import "server-only";

import { upload } from "@/shared/_controllers/data-source.server";

// 업로드 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(지금은 _mock/upload.ts, Spring 연결 후 upload.api.ts). 주석의 경로는 예정 엔드포인트다.

/** POST /api/admin/uploads/presign */
export const presignUpload = upload.presignUpload;

/** POST /api/admin/uploads/complete */
export const completeUpload = upload.completeUpload;

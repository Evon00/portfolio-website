import "server-only";

import { dashboard } from "@/shared/_controllers/data-source.server";

// 대시보드 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(지금은 _mock/dashboard.ts, Spring 연결 후 dashboard.api.ts). 주석의 경로는 예정 엔드포인트다.

/** 대시보드 요약. GET /api/admin/dashboard */
export const getDashboard = dashboard.getDashboard;

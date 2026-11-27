import "server-only";

import { profile } from "@/shared/_controllers/data-source.server";

// 프로필 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(지금은 _mock/profile.ts, Spring 연결 후 profile.api.ts). 주석의 경로는 예정 엔드포인트다.

/** GET /api/profile (어드민도 같은 응답을 쓴다) */
export const getProfile = profile.getProfile;

/** PUT /api/admin/profile */
export const updateProfile = profile.updateProfile;

import "server-only";

import { profile } from "@/shared/_controllers/data-source.server";

// 프로필 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓴다.

/** GET /api/profile (어드민도 같은 응답을 쓴다) */
export const findProfile = profile.findProfile;

/** PATCH /api/admin/profile (보낸 필드만 수정) */
export const updateProfile = profile.updateProfile;

import "server-only";

import { profile } from "@/shared/_controllers/data-source.server";

// 프로필 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓴다.

/** GET /api/profile (어드민도 같은 응답을 쓴다) */
export const findProfile = profile.findProfile;

/** PATCH /api/admin/profile (보낸 필드만 수정) */
export const updateProfile = profile.updateProfile;

/** PUT /api/admin/profile/skill (핵심 기술 스택 전체 교체, 배열 순서 = 노출 순서) */
export const updateProfileSkills = profile.updateProfileSkills;

/** POST /api/admin/profile/image (multipart `file`, 기존 이미지 교체) */
export const uploadProfileImage = profile.uploadProfileImage;

/** DELETE /api/admin/profile/image */
export const deleteProfileImage = profile.deleteProfileImage;

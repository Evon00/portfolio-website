import "server-only";

import type { ProfileResponse, ProfileSaveRequest } from "@/shared/_generated";
import { mockDb, mockDelay, resolveSkills } from "./store";

// 프로필 목 구현(서버 메모리). 인자 · 반환 모양은 profile/profile.api.ts(실제 구현)와 같다(data-source.server.ts의 satisfies가 확인한다).
// data-source.server.ts가 이 파일을 고른다. Spring 연결 때 profile/profile.api.ts로 바꾸면 이 파일은 지운다.

/** GET /api/profile (어드민도 같은 응답을 쓴다) */
export async function getProfile(): Promise<ProfileResponse> {
  await mockDelay();
  const { coreSkillIds, ...profile } = mockDb.profile;
  return { ...profile, coreSkills: resolveSkills(coreSkillIds) };
}

/** PUT /api/admin/profile */
export async function updateProfile(request: ProfileSaveRequest): Promise<ProfileResponse> {
  await mockDelay();
  Object.assign(mockDb.profile, request);
  return getProfile();
}

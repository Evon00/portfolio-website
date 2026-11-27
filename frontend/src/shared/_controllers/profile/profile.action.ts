"use server";

import type { UpdateProfileRequestDto } from "@/shared/_generated";
import { invalidateProfile } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { updateProfile } from "./profile.service";
import type { ProfileView } from "./profile.types";

/**
 * 바뀐 필드만 담는다(Spring PATCH: 보내지 않은 필드는 기존 값 유지).
 * GitHub 주소 · 이메일은 빈 문자열을 보내면 값을 비운다.
 */
export type ProfileChanges = Partial<Pick<ProfileView, "name" | "intro">> & {
  githubUrl?: string;
  email?: string;
};

export async function updateProfileAction(changes: ProfileChanges) {
  return withAdminAction(async () => {
    const body: UpdateProfileRequestDto = {
      adminName: changes.name,
      adminDescription: changes.intro,
      adminGithubUrl: changes.githubUrl,
      adminEmail: changes.email,
    };
    const saved = await updateProfile(body);
    invalidateProfile();
    return {
      name: saved.adminName,
      intro: saved.adminDescription,
      githubUrl: saved.adminGithubUrl,
      email: saved.adminEmail,
      avatarUrl: saved.adminProfileUrl,
    } satisfies Omit<ProfileView, "coreSkills">;
  });
}

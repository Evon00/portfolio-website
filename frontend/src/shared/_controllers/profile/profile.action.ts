"use server";

import type { UpdateProfileRequestDto } from "@/shared/_generated";
import { invalidateProfile } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { deleteProfileImage, updateProfile, updateProfileSkills, uploadProfileImage } from "./profile.service";
import { type ProfileView, toCoreSkillView } from "./profile.types";

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

/** 핵심 기술 스택은 전체 교체다(Spring PUT). 고른 순서가 메인 노출 순서가 된다. */
export async function updateProfileSkillsAction(skillIds: number[]) {
  return withAdminAction(async () => {
    const saved = await updateProfileSkills({ skillIds });
    invalidateProfile();
    return saved.skills.map(toCoreSkillView);
  });
}

/**
 * 프로필 이미지는 저장 버튼과 상관없이 바로 바뀐다(Spring이 업로드 즉시 교체하고 이전 파일을 지운다).
 * 화면은 브라우저에서 변환한 이미지를 FormData(`image`)로 보내고, 여기서 Spring multipart(`file` 파트)로 바꾼다.
 */
export async function uploadProfileImageAction(form: FormData) {
  return withAdminAction(async () => {
    const image = form.get("image");
    const body = new FormData();
    if (image instanceof Blob && image.size > 0) body.append("file", image);
    const saved = await uploadProfileImage(body);
    invalidateProfile();
    return saved.adminProfileUrl;
  });
}

/** 등록된 이미지가 없어도 성공한다(Spring 멱등). */
export async function deleteProfileImageAction() {
  return withAdminAction(async () => {
    await deleteProfileImage();
    invalidateProfile();
    return null;
  });
}

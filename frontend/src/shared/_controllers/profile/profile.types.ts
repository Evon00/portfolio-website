import type { FindProfileItem, FindProfileResponseDto } from "@/shared/_generated";
import { type SkillView, toSkillCategory } from "@/shared/_controllers/skill/skill.types";

// 히어로 위 직무 문구. 관리자가 한 명이고 바뀔 일이 거의 없어 Spring에 두지 않고 프론트 상수로 둔다.
export const PROFILE_ROLE = "BACKEND DEVELOPER";

/** 핵심 기술 스택 한 줄. 기술 스택 목록(SkillView)에서 고른 항목도 그대로 넣을 수 있다. */
export type CoreSkillView = Omit<SkillView, "createdAt">;

/** 화면용 프로필. GitHub · 이메일 · 프로필 이미지는 비어 있을 수 있다(null이면 화면에서 숨긴다). */
export type ProfileView = {
  name: string;
  intro: string;
  githubUrl: string | null;
  email: string | null;
  avatarUrl: string | null;
  coreSkills: CoreSkillView[];
};

export function toCoreSkillView(skill: FindProfileItem): CoreSkillView {
  return {
    skillId: skill.skillId,
    name: skill.skillName,
    category: toSkillCategory(skill.skillCategory),
    iconUrl: skill.skillUrl,
  };
}

export function toProfileView(profile: FindProfileResponseDto): ProfileView {
  return {
    name: profile.adminName,
    intro: profile.adminDescription,
    githubUrl: profile.adminGithubUrl,
    email: profile.adminEmail,
    avatarUrl: profile.adminProfileUrl,
    // Spring이 priority 오름차순으로 준다.
    coreSkills: profile.skills.map(toCoreSkillView),
  };
}

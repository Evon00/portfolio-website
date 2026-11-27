"use server";

import type { SkillSaveRequest } from "@/shared/_generated";
import { invalidateSkills } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { createSkill, deleteSkill, updateSkill } from "./skill.service";

// 기술 스택은 카드·상세·히어로에 함께 들어가므로 skills 태그 하나로 모두 비운다(설계 문서 6절).

export async function createSkillAction(request: SkillSaveRequest) {
  return withAdminAction(async () => {
    const skill = await createSkill(request);
    invalidateSkills();
    return skill;
  });
}

export async function updateSkillAction(skillId: number, request: SkillSaveRequest) {
  return withAdminAction(async () => {
    const skill = await updateSkill({ skillId }, request);
    invalidateSkills();
    return skill;
  });
}

export async function deleteSkillAction(skillId: number) {
  return withAdminAction(async () => {
    await deleteSkill({ skillId });
    invalidateSkills();
    return null;
  });
}

"use server";

import { toMultipartBody } from "@/shared/libs/api/client";
import { invalidateSkills } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { createSkill, deleteSkill, updateSkill } from "./skill.service";
import { type SkillCategory, toSkillCategoryValue, toSkillView } from "./skill.types";

// 기술 스택은 카드·상세·히어로에 함께 들어가므로 skills 태그 하나로 모두 비운다(설계 문서 6절).
// 아이콘 파일이 있어 화면은 FormData(name · category · icon · deleteIcon)로 보내고, 여기서 Spring multipart로 바꾼다.

function readForm(form: FormData) {
  const icon = form.get("icon");
  return {
    name: String(form.get("name") ?? "").trim(),
    category: String(form.get("category") ?? "") as SkillCategory,
    icon: icon instanceof Blob && icon.size > 0 ? icon : null,
    deleteIcon: form.get("deleteIcon") === "true",
  };
}

export async function createSkillAction(form: FormData) {
  return withAdminAction(async () => {
    const { name, category, icon } = readForm(form);
    const skill = await createSkill(
      toMultipartBody({ skillName: name, skillCategory: toSkillCategoryValue(category) }, { file: icon }),
    );
    invalidateSkills();
    return toSkillView(skill);
  });
}

export async function updateSkillAction(skillId: number, form: FormData) {
  return withAdminAction(async () => {
    const { name, category, icon, deleteIcon } = readForm(form);
    const skill = await updateSkill(
      { skillId },
      toMultipartBody(
        { skillName: name, skillCategory: toSkillCategoryValue(category), deleteIcon: !icon && deleteIcon },
        { file: icon },
      ),
    );
    invalidateSkills();
    return toSkillView(skill);
  });
}

export async function deleteSkillAction(skillId: number) {
  return withAdminAction(async () => {
    await deleteSkill({ skillId });
    invalidateSkills();
    return null;
  });
}

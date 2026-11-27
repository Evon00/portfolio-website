import type { FindAllSkillsItem } from "@/shared/_generated";

// 기술 스택 분류 5종 (Figma Category Tag)
export type SkillCategory = "FRONTEND" | "BACKEND" | "DATABASE" | "DEVOPS" | "TOOLS";

export const CATEGORY_LABEL: Record<SkillCategory, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASE: "Database",
  DEVOPS: "DevOps",
  TOOLS: "Tools",
};

/** 화면용 기술 스택. 목록 · 추가 · 수정 응답(모양이 같다)을 toSkillView로 바꿔 쓴다. */
export type SkillView = {
  skillId: number;
  name: string;
  category: SkillCategory;
  iconUrl: string | null;
  createdAt: string;
};

/**
 * Spring은 카테고리를 표시 이름 그대로(`Backend` 등) 저장한다. 화면 5종과 대소문자 무시로 맞추고,
 * 5종 밖의 값(Swagger 등으로 직접 넣은 값)은 Tools로 보여 준다.
 */
export function toSkillCategory(value: string): SkillCategory {
  const key = value.trim().toLowerCase();
  const match = (Object.keys(CATEGORY_LABEL) as SkillCategory[]).find(
    (category) => CATEGORY_LABEL[category].toLowerCase() === key,
  );
  return match ?? "TOOLS";
}

/** 화면 분류 → Spring에 저장하는 카테고리 문자열 */
export function toSkillCategoryValue(category: SkillCategory) {
  return CATEGORY_LABEL[category];
}

export function toSkillView(skill: FindAllSkillsItem): SkillView {
  return {
    skillId: skill.skillId,
    name: skill.skillName,
    category: toSkillCategory(skill.skillCategory),
    iconUrl: skill.skillUrl,
    createdAt: skill.createdAt,
  };
}

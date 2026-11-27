import type { SkillResponse } from "@/shared/_controllers/_legacy-types";

// 기술 스택 분류 5종 (Figma Category Tag)
export type SkillCategory = SkillResponse["category"];

export const CATEGORY_LABEL: Record<SkillCategory, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASE: "Database",
  DEVOPS: "DevOps",
  TOOLS: "Tools",
};

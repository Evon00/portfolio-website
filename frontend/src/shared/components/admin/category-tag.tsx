import { CATEGORY_LABEL, type SkillCategory } from "@/shared/_controllers/skill";
import { cn } from "@/shared/utils";

// Figma Components › Category Tag. 기술 스택 분류 5종.
const TONE: Record<SkillCategory, string> = {
  FRONTEND: "bg-primary-light text-primary-hover",
  BACKEND: "bg-accent-sage-bg text-accent-sage-text",
  DATABASE: "bg-accent-blue-bg text-accent-blue-text",
  DEVOPS: "bg-accent-mustard-bg text-accent-mustard-text",
  TOOLS: "bg-background-04 text-content-02",
};

export function CategoryTag({ category, className }: { category: SkillCategory; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-control px-2.5 py-0.5 font-mono text-mono-m", TONE[category], className)}>
      {CATEGORY_LABEL[category]}
    </span>
  );
}

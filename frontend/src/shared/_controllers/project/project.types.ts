import type { ProjectSummaryResponse } from "@/shared/_generated";
import type { SkillView } from "@/shared/components/skill";

// 프로젝트 화면용 타입과, 그 타입을 만드는 변환·표기 함수.

/** 프로젝트 카드가 그리는 데 필요한 값 */
export type ProjectCardView = {
  slug: string;
  title: string;
  summary: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** null이면 진행 중 */
  endDate: string | null;
  skills: SkillView[];
  thumbnailUrl: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  repoPrivate: boolean;
};

/** "2026.07" */
export function formatYearMonth(date: string) {
  return date.slice(0, 7).replace("-", ".");
}

/** Figma 카드 기간 표기: "2026.07 – 2026.09" · 진행 중이면 "2026.07 –" */
export function formatPeriod(startDate: string, endDate: string | null) {
  return endDate ? `${formatYearMonth(startDate)} – ${formatYearMonth(endDate)}` : `${formatYearMonth(startDate)} –`;
}

export function toProjectCardView(project: ProjectSummaryResponse): ProjectCardView {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    startDate: project.startDate,
    endDate: project.endDate,
    skills: project.skills.map((skill) => ({ name: skill.name, iconUrl: skill.iconUrl })),
    thumbnailUrl: project.thumbnailUrl,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    repoPrivate: project.repoPrivate,
  };
}

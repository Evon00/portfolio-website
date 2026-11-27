import type {
  FindAllAdminProjectsItem,
  FindAllProjectsItem,
  FindProjectBySlugResponseDto,
  FindProjectResponseDto,
  ProjectSkillItem,
} from "@/shared/_generated";
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

/** 공개 상세. 갤러리는 노출 순서대로. */
export type ProjectDetailView = Omit<ProjectCardView, "thumbnailUrl"> & {
  projectId: number;
  content: string;
  images: { url: string; caption: string | null }[];
};

/** 어드민 목록 한 줄. 배열 순서 = 노출 순서. */
export type ProjectRowView = Pick<ProjectCardView, "slug" | "title" | "startDate" | "endDate" | "skills"> & {
  projectId: number;
  imageCount: number;
};

/** 어드민 수정 화면의 저장된 갤러리 이미지 */
export type ProjectMediaView = { id: number; url: string; caption: string | null; fileName: string };

/** 어드민 수정 화면 */
export type ProjectEditView = Omit<ProjectCardView, "skills" | "thumbnailUrl"> & {
  projectId: number;
  content: string;
  /** 노출 순서대로 */
  skillIds: number[];
  /** 노출 순서대로, 첫 장이 대표 */
  images: ProjectMediaView[];
};

/** 공개 목록·어드민 목록을 한 번에 받는 개수(Spring 최대 50). 프로젝트는 전부 받아 화면에서 나눈다. */
export const PROJECT_LIST_SIZE = 50;
/** 메인 주요 프로젝트 캐러셀: 노출 순서 상위 몇 개를 보여 줄지 */
export const FEATURED_PROJECT_COUNT = 6;

/** "2026.07" */
export function formatYearMonth(date: string) {
  return date.slice(0, 7).replace("-", ".");
}

/** Figma 카드 기간 표기: "2026.07 – 2026.09" · 진행 중이면 "2026.07 –" */
export function formatPeriod(startDate: string, endDate: string | null) {
  return endDate ? `${formatYearMonth(startDate)} – ${formatYearMonth(endDate)}` : `${formatYearMonth(startDate)} –`;
}

function toSkillView(skill: ProjectSkillItem): SkillView {
  return { name: skill.skillName, iconUrl: skill.skillUrl };
}

/** Spring은 "레포 공개 여부"를 저장한다. 화면은 "비공개 레포"로 다룬다. */
type ProjectLinks = Pick<FindAllProjectsItem, "projectGithubUrl" | "projectGithubIsPublic" | "projectUrl">;
function toLinks(project: ProjectLinks) {
  return {
    githubUrl: project.projectGithubUrl,
    repoPrivate: !project.projectGithubIsPublic,
    demoUrl: project.projectUrl,
  };
}

export function toProjectCardView(project: FindAllProjectsItem): ProjectCardView {
  return {
    slug: project.projectSlug,
    title: project.projectTitle,
    summary: project.projectSummary,
    startDate: project.projectStartDate,
    endDate: project.projectEndDate,
    skills: project.skills.map(toSkillView),
    thumbnailUrl: project.projectMediaUrl,
    ...toLinks(project),
  };
}

export function toProjectDetailView(project: FindProjectBySlugResponseDto): ProjectDetailView {
  return {
    projectId: project.projectId,
    slug: project.projectSlug,
    title: project.projectTitle,
    summary: project.projectSummary,
    content: project.projectContent,
    startDate: project.projectStartDate,
    endDate: project.projectEndDate,
    skills: project.skills.map(toSkillView),
    images: project.projectMedias.map((media) => ({ url: media.projectMediaUrl, caption: media.projectMediaCaption })),
    ...toLinks(project),
  };
}

export function toProjectRowView(project: FindAllAdminProjectsItem): ProjectRowView {
  return {
    projectId: project.projectId,
    slug: project.projectSlug,
    title: project.projectTitle,
    startDate: project.projectStartDate,
    endDate: project.projectEndDate,
    skills: project.skills.map(toSkillView),
    imageCount: project.projectMediaCount,
  };
}

/** 대표 이미지(projectMediaIsImportant)를 맨 앞에 둔다. 화면은 첫 장을 대표로 다룬다. */
export function toProjectEditView(project: FindProjectResponseDto): ProjectEditView {
  const medias = [...project.projectMedias].sort(
    (a, b) => Number(b.projectMediaIsImportant) - Number(a.projectMediaIsImportant),
  );
  return {
    projectId: project.projectId,
    slug: project.projectSlug,
    title: project.projectTitle,
    summary: project.projectSummary,
    content: project.projectContent,
    startDate: project.projectStartDate,
    endDate: project.projectEndDate,
    skillIds: project.skills.map((skill) => skill.skillId),
    images: medias.map((media) => ({
      id: media.projectMediaId,
      url: media.projectMediaUrl,
      caption: media.projectMediaCaption,
      fileName: media.projectMediaOriginalName,
    })),
    ...toLinks(project),
  };
}

/**
 * 노출 순서 저장. Spring은 프로젝트 하나를 전체 목록의 한 위치(1부터)로 옮기는 API만 있다.
 * 원래 순서에서 바라는 순서가 되도록, 앞에서부터 자리가 다른 프로젝트를 그 자리로 옮기는 이동 목록을 만든다.
 */
export function toPriorityMoves(currentIds: number[], targetIds: number[]) {
  const order = [...currentIds];
  const moves: { projectId: number; position: number }[] = [];
  targetIds.forEach((projectId, index) => {
    if (order[index] === projectId) return;
    order.splice(order.indexOf(projectId), 1);
    order.splice(index, 0, projectId);
    moves.push({ projectId, position: index + 1 });
  });
  return moves;
}

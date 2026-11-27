import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS, isApiError } from "@/shared/libs/api";
import { renderMarkdown } from "@/shared/libs/markdown/render";
import { findAllProjects, findProjectBySlug } from "./project.service";
import { PROJECT_LIST_SIZE, toProjectCardView, toProjectDetailView } from "./project.types";

// 공개 페이지 캐시 (설계 문서 6절). 목록 hours, 상세 days.

/** 프로젝트 목록·메인 캐러셀이 쓰는 전체 목록(노출 순서대로) */
export async function getCachedProjects() {
  "use cache";
  cacheTag(CACHE_TAGS.projects, CACHE_TAGS.skills);
  cacheLife("hours");
  const page = await findAllProjects({ pageNumber: 0, pageSize: PROJECT_LIST_SIZE });
  return page.content.map(toProjectCardView);
}

/** 상세 + 렌더링된 본문 HTML */
export async function getCachedProjectDetail(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.skills);
  cacheLife("days");
  // 없는 프로젝트는 404로 오고, 화면(notFound)이 쓰도록 여기 한 곳에서만 null로 바꾼다.
  const project = await findProjectBySlug({ projectSlug: slug }).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  });
  if (!project) {
    // 없는 slug의 결과(null)도 캐시되므로 목록 태그를 붙여, 그 slug로 등록 · 수정 · 삭제하면(목록 태그를 비운다) 바로 다시 찾게 한다.
    cacheTag(CACHE_TAGS.projects);
    return null;
  }
  cacheTag(CACHE_TAGS.project(project.projectId));
  const html = await renderMarkdown(project.projectContent);
  return { project: toProjectDetailView(project), html };
}

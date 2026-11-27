"use client";

import { useUrlState } from "@/shared/hooks";
import { Pagination } from "@/shared/components/pagination";
import type { ProjectCardView } from "@/shared/_controllers/project";
import { ProjectGridCard } from "./project-grid-card";

// 프로젝트 목록: 캐시된 전체 목록을 받아 브라우저에서 페이지를 나눈다(설계 문서 6절). 한 페이지 6개.
// Figma: 1280 이상 3열(352 · 간격 32), 768 이상 2열, 그 아래 1열. 행 간격 56.
const PAGE_SIZE = 6;
const DEFAULTS = { page: "1" };

export function ProjectList({ projects }: { projects: ProjectCardView[] }) {
  const [state, update] = useUrlState(DEFAULTS);
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(state.page) || 1), totalPages);
  const visible = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-14">
      <ul className="grid grid-cols-1 gap-x-8 gap-y-fluid-40-56 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((project) => (
          <li key={project.slug} className="min-w-0">
            <ProjectGridCard project={project} className="h-full" />
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(next) => {
          update({ page: String(next) });
          window.scrollTo({ top: 0 });
        }}
        className="mt-6"
      />
    </div>
  );
}

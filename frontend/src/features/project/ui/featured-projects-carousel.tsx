"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { CarouselArrow, CarouselDots } from "@/shared/components/carousel-controls";
import { useSwipePager } from "@/shared/hooks";
import { TextLink } from "@/shared/components/text-link";
import { SectionTitle } from "@/shared/components/title";
import type { ProjectCardView } from "@/shared/_controllers/project";
import { ProjectCard } from "./project-card";

// Figma Components › Featured Projects Carousel. 메인 · 주요 프로젝트.
// 열 수·간격: 1280 이상 3열 40px / 768~1279 2열 32px / 768 미만 1열 24px (Figma).
// 한 페이지 = 열 수만큼, 350ms ease-in-out으로 넘긴다.
// 1열일 때 카드는 Figma 480 프레임 폭(431.6)을 넘지 않게 432px로 묶고 가운데 둔다. 480~767에서 카드가 화면만큼 커졌다가 768에서 절반으로 줄어 튀지 않게.
// 카드 폭·간격·점 개수는 CSS 중단점으로 정해 JS 실행 전에도 맞게 보인다. JS는 현재 페이지와 이동만 맡는다.
// 첫 페이지 이전 · 마지막 페이지 다음 화살표는 Disabled.
// 카드 위로 걸친 캐릭터·테이프(최대 70px)가 잘리지 않게 뷰포트 위쪽에 70px 여유를 둔다.
// 넘기기: 화살표 · 점 · 키보드 ←→ · 터치 스와이프 · 마우스 드래그 · 트랙패드 좌우 스와이프(useSwipePager).
// 끄는 동안 트랙은 --drag-offset만큼 따라오고, 놓으면 가까운 페이지로 --duration-carousel 동안 스냅한다.
// 줄인 움직임(prefers-reduced-motion)이면 애니메이션 없이 바로 옮긴다.
const QUERIES = [
  { query: "(min-width: 1280px)", columns: 3 },
  { query: "(min-width: 768px)", columns: 2 },
];

function useColumns() {
  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const lists = QUERIES.map(({ query }) => window.matchMedia(query));
    const update = () => setColumns(QUERIES.find((_, i) => lists[i]?.matches)?.columns ?? 1);
    update();
    lists.forEach((list) => list.addEventListener("change", update));
    return () => lists.forEach((list) => list.removeEventListener("change", update));
  }, []);
  return columns;
}

export function FeaturedProjectsCarousel({ projects }: { projects: ProjectCardView[] }) {
  const columns = useColumns();
  const pageCount = Math.max(1, Math.ceil(projects.length / columns));
  const [page, setPage] = useState(0);
  const current = Math.min(page, pageCount - 1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  useSwipePager(viewportRef, trackRef, { page: current, pageCount, onPageChange: setPage });

  // 키보드 ←→: 카드에 포커스가 있었으면 넘긴 페이지의 첫 카드로 옮긴다(보이지 않게 된 카드는 inert라 포커스를 잃는다).
  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = Math.min(Math.max(current + (event.key === "ArrowRight" ? 1 : -1), 0), pageCount - 1);
    if (next === current) return;
    const focusCard = trackRef.current?.contains(document.activeElement) ?? false;
    setPage(next);
    if (focusCard) {
      requestAnimationFrame(() =>
        trackRef.current?.querySelector<HTMLElement>("li:not([aria-hidden=true]) [data-card-link]")?.focus(),
      );
    }
  }

  return (
    <section aria-roledescription="carousel" aria-label="주요 프로젝트" className="flex flex-col" onKeyDown={onKeyDown}>
      <div className="flex flex-col gap-fluid-12-16 md:flex-row md:items-end md:justify-between">
        <SectionTitle className="self-start">주요 프로젝트</SectionTitle>
        <div className="flex items-center justify-between gap-3">
          <TextLink href="/projects">전체 프로젝트 보기 →</TextLink>
          <div className="flex gap-3">
            <CarouselArrow direction="prev" disabled={current === 0} onClick={() => setPage(current - 1)} />
            <CarouselArrow direction="next" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)} />
          </div>
        </div>
      </div>

      {/* 카드 폭 = (뷰포트 - 간격 × (열-1)) / 열. 한 페이지 이동 = 뷰포트 + 간격 */}
      <div ref={viewportRef} className="cursor-grab touch-pan-y overflow-hidden pt-[70px] pb-7">
        <ul
          ref={trackRef}
          className="flex gap-(--carousel-gap) transition-transform duration-(--duration-carousel) ease-in-out [--carousel-gap:var(--spacing-fluid-24-40)] motion-reduce:transition-none data-dragging:cursor-grabbing data-dragging:transition-none data-dragging:select-none data-dragging:[&_*]:cursor-grabbing"
          style={{
            transform: `translateX(calc(${-current} * (100% + var(--carousel-gap)) + var(--drag-offset, 0px)))`,
          }}
        >
          {projects.map((project, i) => {
            const visible = Math.floor(i / columns) === current;
            return (
              <li
                key={project.slug}
                aria-hidden={!visible}
                inert={!visible}
                className="shrink-0 basis-full md:basis-[calc((100%-var(--carousel-gap))/2)] xl:basis-[calc((100%-2*var(--carousel-gap))/3)]"
              >
                <ProjectCard project={project} className="mx-auto h-full max-w-[432px] md:max-w-none" />
              </li>
            );
          })}
        </ul>
      </div>

      {/* 열 수별 점 묶음을 모두 그리고 CSS로 하나만 보인다. */}
      {[
        { columns: 1, className: "md:hidden" },
        { columns: 2, className: "hidden md:flex xl:hidden" },
        { columns: 3, className: "hidden xl:flex" },
      ].map((set) => {
        const count = Math.ceil(projects.length / set.columns);
        if (count <= 1) return null;
        return (
          <CarouselDots
            key={set.columns}
            count={count}
            active={Math.min(page, count - 1)}
            onSelect={setPage}
            className={`mt-8 ${set.className}`}
          />
        );
      })}
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { CARD_FOCUS_RING, CARD_LINK, CARD_MORE } from "@/shared/components/card-link";
import { ImagePlaceholder } from "@/shared/components/image-placeholder";
import { SkillTagRow } from "@/shared/components/skill-tag-row";
import { StatusBadge } from "@/shared/components/status-badge";
import { cn } from "@/shared/utils";
import { formatPeriod, type ProjectCardView } from "@/shared/_controllers/project";
import { ProjectLinks } from "./project-links";

// Figma Components › Project Card / Grid. 프로젝트 목록 카드.
// Thumb=Paper는 이미지 없을 때. Status=Live는 진행 중.
// 카드 어디를 눌러도 상세로 간다(제목 링크를 카드 크기로 늘림, card-link.ts). 코드·사이트 버튼만 따로 동작.
// "자세히 보기 →"는 장식 표시(aria-hidden)이고 제목 링크의 설명(aria-describedby)으로 읽힌다.
// Hover(Figma State=Hover), 카드 키보드 포커스 때도 같다(card-active): border → primary-muted · Shadow/Panel · 제목 → primary-strong · "자세히 보기" 0.55.
export function ProjectGridCard({ project, className }: { project: ProjectCardView; className?: string }) {
  const moreId = `project-grid-${project.slug}-more`;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-pill border-2 border-line-01 bg-background-01 transition-[border-color,box-shadow]",
        "card-active:border-primary-muted card-active:shadow-panel",
        CARD_FOCUS_RING,
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-line-03 bg-background-05">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 352px, 90vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder purpose="project" ratio="16:10" className="absolute inset-0 rounded-none" />
        )}
      </div>
      <div className="flex flex-col gap-2.5 px-6 pt-[22px] pb-4">
        <div className="flex h-6 items-center gap-2 font-mono text-mono-m text-content-02">
          {formatPeriod(project.startDate, project.endDate)}
          {!project.endDate && <StatusBadge />}
        </div>
        <h3 className="truncate font-display text-title-3 text-content-01 transition-colors group-card-active:text-primary-strong">
          <Link href={`/projects/${project.slug}`} data-card-link aria-describedby={moreId} className={CARD_LINK}>
            {project.title}
          </Link>
        </h3>
        <p className="line-clamp-2 h-[50px] text-body-m text-content-02">{project.summary}</p>
        <SkillTagRow skills={project.skills} tone="lavender" />
        <div className="flex items-center justify-between border-t border-line-01 pt-2.5">
          <span id={moreId} aria-hidden className={cn("flex h-11 items-center", CARD_MORE)}>
            자세히 보기 →
          </span>
          <ProjectLinks project={project} tone="paper" />
        </div>
      </div>
    </article>
  );
}

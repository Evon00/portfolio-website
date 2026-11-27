import Image from "next/image";
import Link from "next/link";
import { CARD_FOCUS_RING, CARD_LINK, CARD_MORE } from "@/shared/components/card-link";
import { ImagePlaceholder } from "@/shared/components/image-placeholder";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { SkillTagRow } from "@/shared/components/skill-tag-row";
import { StatusBadge } from "@/shared/components/status-badge";
import { cn } from "@/shared/utils";
import { formatPeriod, type ProjectCardView } from "@/shared/_controllers/project";
import { ProjectLinks } from "./project-links";

// Figma Components › Project Card. 메인 주요 프로젝트 캐러셀의 종이 콜라주 카드.
// Lavender=기본 / Blue=진행 중(endDate 없음) / Paper=이미지 없음. 종이는 카드 크기에 맞춰 늘어난다.
// 겹침 순서(Figma): 뒤로 숨는 캐릭터 → 종이 → 내용 → 앞의 테이프. 카드가 isolate라 캐릭터·종이는 음수 z로 내용 뒤에 둔다.
// 카드 어디를 눌러도 상세로 간다: 제목 링크를 카드 크기로 늘린다(card-link.ts). 코드·사이트 버튼만 따로 동작.
// "자세히 보기 →"는 장식 표시(aria-hidden)이고 제목 링크의 설명(aria-describedby)으로 읽힌다.
// Hover(Figma State=Hover), 카드 키보드 포커스 때도 같다(card-active): 제목 → primary-strong · 종이에 Shadow/Paper lift · 테이프가 조금 더 기운다 · "자세히 보기" 0.55.
type Style = "lavender" | "blue" | "paper";

// 종이는 9-slice로 늘린다: 찢긴 가장자리·모서리는 Figma 카드(346×526)에서 보이는 두께로 고정하고 가운데만 늘린다.
// 통째로 늘리면 카드가 넓어질 때(480~767에서 한 장씩 보일 때) 가장자리가 같이 두꺼워져 내용이 종이 밖으로 나간다.
// slice: 원본 이미지에서 가장자리로 쓸 폭(px, 위·오른쪽·아래·왼쪽), width: Figma 카드 크기에서 그 부분이 차지하는 폭(px).
const PANELS: Record<Style, { src: string; slice: string; width: string }> = {
  lavender: {
    src: "/images/panels/panel-lavender-wide.webp",
    slice: "73 72 48 70",
    width: "67.8px 29.7px 44.6px 28.8px",
  },
  blue: { src: "/images/panels/panel-blue-wide.webp", slice: "80 80 39 69", width: "77.9px 40.5px 38px 34.9px" },
  paper: { src: "/images/panels/panel-cream-wide.webp", slice: "52 57 59 52", width: "49.9px 19px 56.6px 17.4px" },
};

function getStyle(project: ProjectCardView): Style {
  if (!project.thumbnailUrl) return "paper";
  return project.endDate ? "lavender" : "blue";
}

export function ProjectCard({ project, className }: { project: ProjectCardView; className?: string }) {
  const style = getStyle(project);
  const moreId = `project-card-${project.slug}-more`;

  return (
    <article
      className={cn(
        "group relative isolate flex flex-col gap-3.5 px-[42px] pt-[68px] pb-11",
        CARD_FOCUS_RING,
        className,
      )}
    >
      {style === "blue" && (
        <PaperAsset
          name="blob-mustard-happy"
          className="-top-[50px] right-[34px] -z-20 h-[89.5px] w-[150px] -rotate-13"
        />
      )}
      {style === "paper" && (
        <PaperAsset name="blob-lavender-surprised" className="-top-[70px] left-7 -z-20 h-[93.33px] w-[140px]" />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 border-solid transition-[filter] group-card-active:drop-shadow-paper-lift"
        style={{
          borderImageSource: `url(${PANELS[style].src})`,
          borderImageSlice: `${PANELS[style].slice} fill`,
          borderImageWidth: PANELS[style].width,
        }}
      />

      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 262px, 80vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder purpose="project" ratio="16:9" className="absolute inset-0" />
        )}
      </div>

      <div className="flex items-center gap-2 font-mono text-mono-l text-content-02">
        {formatPeriod(project.startDate, project.endDate)}
        {!project.endDate && <StatusBadge />}
      </div>
      <h3 className="line-clamp-2 font-display text-title-3 text-content-01 transition-colors group-card-active:text-primary-strong">
        <Link href={`/projects/${project.slug}`} data-card-link aria-describedby={moreId} className={CARD_LINK}>
          {project.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-body-m text-content-01">{project.summary}</p>
      <SkillTagRow skills={project.skills} tone="white" />

      <div className="flex items-center justify-between pt-1.5">
        <span id={moreId} aria-hidden className={cn("flex h-11 items-center", CARD_MORE)}>
          자세히 보기 →
        </span>
        <ProjectLinks project={project} tone="white" />
      </div>

      {style === "lavender" && (
        <PaperAsset
          name="tape-lavender-check"
          className="-top-4 left-1/2 h-[34.58px] w-[120px] -translate-x-1/2 rotate-3 transition-transform group-card-active:rotate-6"
        />
      )}
      {style === "blue" && (
        <PaperAsset
          name="tape-beige"
          className="top-1 left-[18px] h-[30.16px] w-[112px] rotate-9 transition-transform group-card-active:rotate-13"
        />
      )}
      {style === "paper" && (
        <PaperAsset
          name="tape-yellow"
          className="-top-3 right-5 h-[31.8px] w-[112px] -rotate-5 transition-transform group-card-active:-rotate-9"
        />
      )}
    </article>
  );
}

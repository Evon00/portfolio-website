import { Icon } from "@/shared/components/icon";
import { IconButton } from "@/shared/components/icon-button";
import { cn } from "@/shared/utils";
import type { ProjectCardView } from "@/shared/_controllers/project";

// 카드 오른쪽 아래 GitHub · 데모 원형 버튼.
// 비공개 레포: GitHub 자리를 Icon/Lock으로 바꾸고 50% 투명, 클릭 불가 · 툴팁 "비공개 저장소예요".
type ProjectLinksProps = {
  project: Pick<ProjectCardView, "githubUrl" | "demoUrl" | "repoPrivate" | "title">;
  tone: "white" | "paper";
};

export function ProjectLinks({ project, tone }: ProjectLinksProps) {
  return (
    <div className="relative z-10 flex gap-1.5">
      {project.repoPrivate ? (
        <span
          role="img"
          aria-label="비공개 저장소예요"
          title="비공개 저장소예요"
          className={cn(
            "flex size-10 items-center justify-center rounded-pill text-primary-strong opacity-50",
            tone === "white" ? "bg-content-inverse" : "bg-background-03",
          )}
        >
          <Icon name="lock" size={18} />
        </span>
      ) : (
        project.githubUrl && (
          <IconButton href={project.githubUrl} icon="code" label={`${project.title} GitHub`} tone={tone} />
        )
      )}
      {project.demoUrl && (
        <IconButton href={project.demoUrl} icon="external" label={`${project.title} 사이트`} tone={tone} />
      )}
    </div>
  );
}

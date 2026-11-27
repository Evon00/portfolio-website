import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCachedProjectDetail, getCachedProjects } from "@/shared/_controllers/project/index.server";
import { formatPeriod } from "@/shared/_controllers/project";
import { Gallery } from "@/features/project/ui/gallery";
import { ArticleFooter } from "@/shared/components/back-button";
import { Button } from "@/shared/components/button";
import { Container } from "@/shared/components/container";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { SkillChipMedium } from "@/shared/components/skill";
import { StatusBadge } from "@/shared/components/status-badge";
import { TextLink } from "@/shared/components/text-link";

// 기존 프로젝트는 빌드 때 미리 만들고, 새 프로젝트는 첫 요청 때 만든 뒤 캐시한다(설계 문서 6절).
const PLACEHOLDER_SLUG = "__placeholder__";

export async function generateStaticParams() {
  const projects = await getCachedProjects();
  return projects.length > 0 ? projects.map((project) => ({ slug: project.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getCachedProjectDetail(slug);
  if (!detail) return {};
  return { title: detail.project.title, description: detail.project.summary };
}

// 목록에 없던 새 slug는 앱 셸(아래 fallback)을 먼저 보내고 본문을 이어서 그린다(Partial Prefetching).
// params는 Suspense 안에서만 읽는다(설계 문서 6절, Next 문서 incremental-static-regeneration-cache-components).
export default function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<Container size="medium" className="min-h-[60vh] pt-fluid-24-40" />}>
      <ProjectDetailPageContent params={params} />
    </Suspense>
  );
}

async function ProjectDetailPageContent({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const detail = slug === PLACEHOLDER_SLUG ? null : await getCachedProjectDetail(slug);
  if (!detail) notFound();
  const { project, html } = detail;
  const showGithub = project.githubUrl && !project.repoPrivate;

  return (
    <article>
      {/* Figma 프로젝트 상세 › project heading (폭 960) */}
      <Container size="medium" className="pt-fluid-24-40">
        <TextLink href="/projects">← 프로젝트 목록</TextLink>
        <p className="mt-9 flex items-center gap-2.5 font-mono text-mono-l text-content-02">
          {formatPeriod(project.startDate, project.endDate)}
          {!project.endDate && <StatusBadge />}
        </p>
        <h1 className="mt-4 font-display text-display-fluid-s-m text-content-01">{project.title}</h1>
        <p className="mt-3 text-body-article text-content-02">{project.summary}</p>
        <div className="mt-7 flex flex-col gap-5">
          <ul className="flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <li key={skill.name}>
                <SkillChipMedium skill={skill} />
              </li>
            ))}
          </ul>
          {/* 비공개 레포: "비공개 저장소" Outline(55%, 클릭 불가) + 사이트 바로가기 Primary (Figma Project Card 설명) */}
          {(project.repoPrivate || showGithub || project.demoUrl) && (
            <div className="flex flex-wrap justify-end gap-3">
              {project.repoPrivate ? (
                <Button
                  variant="outline"
                  icon="lock"
                  aria-disabled
                  className="min-w-40 opacity-55"
                  title="비공개 저장소예요"
                >
                  비공개 저장소
                </Button>
              ) : (
                showGithub && (
                  <Button
                    href={project.githubUrl ?? undefined}
                    variant={project.demoUrl ? "outline" : "primary"}
                    icon="code"
                    className="min-w-40"
                  >
                    GitHub
                  </Button>
                )
              )}
              {project.demoUrl && (
                <Button href={project.demoUrl} icon="external" className="min-w-40">
                  사이트 바로가기
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Figma gallery wrap: 갤러리 왼쪽 위에 놀란 라벤더 캐릭터가 뒤에서 걸쳐 있다(64, -75, 134×89). */}
      <Container size="medium" className="pt-[110px] pb-[72px]">
        <div className="relative">
          <PaperAsset name="blob-lavender-surprised" className="-top-[75px] left-16 h-[89px] w-[134px]" />
          <div className="relative">
            <Gallery title={project.title} images={project.images} />
          </div>
        </div>
      </Container>

      <Container size="medium" className="pb-40">
        <div className="prose prose-project" dangerouslySetInnerHTML={{ __html: html }} />
        <ArticleFooter
          backHref="/projects"
          end={
            // Figma: 비공개 레포는 오른쪽 링크 없이 목록으로만 둔다.
            showGithub && <TextLink href={project.githubUrl ?? undefined}>GitHub에서 코드 보기 →</TextLink>
          }
          className="mt-14"
        />
      </Container>
    </article>
  );
}

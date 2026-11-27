import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BlogCardFeatured, BlogCardItem, BlogRow } from "@/features/post/ui/blog-cards";
import { FeaturedProjectsCarousel } from "@/features/project/ui/featured-projects-carousel";
import { Gallery } from "@/features/project/ui/gallery";
import { ProjectCard } from "@/features/project/ui/project-card";
import { ProjectGridCard } from "@/features/project/ui/project-grid-card";
import { ArticleFooter } from "@/shared/components/back-button";
import { Button } from "@/shared/components/button";
import { ButtonCompact } from "@/shared/components/button-compact";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorVisual } from "@/shared/components/error-visual";
import { AlertDanger, Checkbox, FormLabel, FormMessage, TextField, Textarea } from "@/shared/components/form";
import { IconButton } from "@/shared/components/icon-button";
import { ImagePlaceholder } from "@/shared/components/image-placeholder";
import { InlineError } from "@/shared/components/inline-error";
import { SkillChipLarge, SkillChipMedium, SkillIcon, SkillTag, SkillTagMore } from "@/shared/components/skill";
import { StatusBadge } from "@/shared/components/status-badge";
import { TextLink } from "@/shared/components/text-link";
import { ScrollTopLink } from "@/shared/components/scroll-top-link";
import { PageTitle, SectionTitle } from "@/shared/components/title";
import { Footer } from "@/widgets/footer/footer";
import { Header } from "@/widgets/header/header";
import { InteractivePreview } from "@/app/ui/_components/interactive-preview";
import { previewPosts, previewProjects } from "@/app/ui/_components/preview-data";

// 개발 전용 컴포넌트 미리보기. Figma Components 페이지와 나란히 비교하는 용도이며 운영 빌드에서는 404.
export const metadata: Metadata = { title: "UI 미리보기", robots: { index: false } };

const profile = {
  name: "유재혁",
  intro: "백엔드를 설계부터 운영 배포까지 책임지고, 팀이 반복하는 작업을 표준으로 만드는 백엔드 개발자입니다.",
  email: "hello@example.com",
  githubUrl: "https://github.com/Even00",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-dashed border-line-02 py-12">
      <p className="font-mono text-eyebrow text-content-03 uppercase">{title}</p>
      {children}
    </section>
  );
}

export default function UiPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [first, second, third, fourth] = previewProjects;
  const [post, post2] = previewPosts;
  if (!first || !second || !third || !fourth || !post || !post2) return null;

  return (
    <>
      <Header {...profile} />
      <main className="mx-auto w-full max-w-[1160px] px-5 pb-40">
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button icon="code">GitHub</Button>
            <Button variant="outline" icon="mail">
              이메일
            </Button>
            <Button size="M" icon="code">
              버튼
            </Button>
            <Button size="M" variant="outline" icon="code">
              버튼
            </Button>
            <Button disabled>비활성</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonCompact>수정</ButtonCompact>
            <ButtonCompact variant="danger">삭제</ButtonCompact>
            <ButtonCompact variant="danger-outline">삭제</ButtonCompact>
            <IconButton icon="code" label="GitHub" />
            <IconButton icon="external" label="사이트" tone="white" />
            <TextLink href="/blog">전체 보기 →</TextLink>
          </div>
        </Section>

        <Section title="Navigation · Chips">
          <InteractivePreview />
          <div className="flex flex-wrap items-center gap-3">
            <SkillTag skill={{ name: "Spring Boot" }} tone="white" />
            <SkillTag skill={{ name: "Spring Boot" }} tone="lavender" />
            <SkillTag skill={{ name: "Spring Boot" }} tone="blue" />
            <SkillTag skill={{ name: "Spring Boot" }} tone="sage" />
            <SkillTagMore count={1} tone="white" />
            <StatusBadge />
            <SkillIcon />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SkillChipLarge skill={{ name: "Java 21" }} tone="lavender" />
            <SkillChipLarge skill={{ name: "Spring Boot" }} tone="blue" />
            <SkillChipLarge skill={{ name: "Redis" }} tone="sage" />
            <SkillChipLarge skill={{ name: "MariaDB" }} tone="mustard" />
            <SkillChipMedium skill={{ name: "Spring Boot 3.5" }} />
          </div>
        </Section>

        <Section title="Forms">
          <div className="grid max-w-[760px] gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FormLabel htmlFor="t1" required>
                제목
              </FormLabel>
              <TextField id="t1" placeholder="[게시글 제목]" />
            </div>
            <div className="flex flex-col gap-2">
              <FormLabel htmlFor="t2" required>
                슬러그
              </FormLabel>
              <TextField id="t2" prefix="/blog/" placeholder="[slug]" />
              <FormMessage status="success">사용할 수 있는 슬러그예요.</FormMessage>
            </div>
            <div className="flex flex-col gap-2">
              <FormLabel htmlFor="t3">오류</FormLabel>
              <TextField id="t3" invalid defaultValue="중복된 값" />
              <FormMessage status="error">이미 쓰고 있는 슬러그예요.</FormMessage>
            </div>
            <div className="flex flex-col gap-2">
              <FormLabel htmlFor="t4">비활성</FormLabel>
              <TextField id="t4" disabled placeholder="진행 중이면 비워 둬요" />
              <FormMessage status="help">등록한 뒤에는 슬러그를 바꿀 수 없어요.</FormMessage>
            </div>
            <Textarea placeholder="[요약 문장]" className="md:col-span-2" />
            <Checkbox defaultChecked>진행 중 (종료일 없음)</Checkbox>
            <Checkbox>비공개 레포지토리</Checkbox>
            <AlertDanger className="md:col-span-2">아이디 또는 비밀번호가 일치하지 않아요.</AlertDanger>
          </div>
        </Section>

        <Section title="Titles">
          <div className="flex flex-wrap items-end gap-10">
            <PageTitle as="p">프로젝트</PageTitle>
            <PageTitle as="p" tape="sage">
              블로그
            </PageTitle>
            <SectionTitle as="p">주요 프로젝트</SectionTitle>
            <SectionTitle as="p" tape="sage">
              블로그
            </SectionTitle>
          </div>
        </Section>

        <Section title="Project Card (collage)">
          <div className="grid gap-x-10 gap-y-24 pt-20 md:grid-cols-2 xl:grid-cols-3">
            <ProjectCard project={first} />
            <ProjectCard project={second} />
            <ProjectCard project={third} />
          </div>
        </Section>

        <Section title="Featured Projects Carousel">
          <FeaturedProjectsCarousel
            projects={[first, second, third, fourth, first, second, third, fourth].map((p, i) => ({
              ...p,
              slug: `${p.slug}-${i}`,
            }))}
          />
        </Section>

        <Section title="Project Card / Grid">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ProjectGridCard project={first} />
            <ProjectGridCard project={second} />
            <ProjectGridCard project={third} />
          </div>
        </Section>

        <Section title="Blog Cards">
          <div className="grid gap-10 pt-24 xl:grid-cols-2">
            <BlogCardFeatured post={post} />
            <div className="flex min-w-0 flex-col gap-8">
              <BlogCardItem post={post2} />
              <BlogCardItem post={post} />
            </div>
          </div>
          <div>
            <BlogRow post={post} />
            <BlogRow post={post2} />
          </div>
        </Section>

        <Section title="Gallery">
          <Gallery
            title="미리보기"
            images={[
              { url: "/images/panels/panel-blue-wide.webp", caption: "학번+이메일 락으로 학생당 1건만 저장" },
              { url: "/images/panels/panel-lavender-wide.webp", caption: null },
              { url: "/images/panels/panel-cream-wide.webp", caption: "세 번째 이미지" },
            ]}
          />
          <Gallery title="빈 갤러리" images={[]} />
        </Section>

        <Section title="Feedback">
          <div className="grid gap-10 md:grid-cols-2">
            <EmptyState
              title="[스킬 2]로 쓴 글이 아직 없어요"
              description="다른 기술 스택을 고르거나 전체 글을 둘러봐 주세요."
              action={{ label: "전체 글 보기", href: "/blog" }}
            />
            <EmptyState
              character="mustard"
              title="검색 결과가 없어요"
              description="다른 검색어로 찾아봐 주세요."
              action={{ label: "전체 글 보기", href: "/blog" }}
            />
            <ErrorVisual type="404" />
            <ErrorVisual type="500" />
          </div>
          <InlineError title="주요 프로젝트를 불러오지 못했어요" onRetry={undefined} />
          <div className="flex flex-wrap items-end gap-6">
            <ImagePlaceholder purpose="project" ratio="16:10" className="w-60" />
            <ImagePlaceholder purpose="post" ratio="16:10" className="w-60" />
            <ImagePlaceholder purpose="profile" ratio="1:1" className="w-40" />
            <ImagePlaceholder purpose="skill" ratio="1:1" className="w-24" />
            <ImagePlaceholder purpose="project" ratio="16:9" className="w-[262px]" />
            <ImagePlaceholder purpose="post" ratio="1:1" className="w-40" />
          </div>
          <ArticleFooter backHref="/blog" end={<ScrollTopLink />} />
        </Section>
      </main>
      <Footer {...profile} />
    </>
  );
}

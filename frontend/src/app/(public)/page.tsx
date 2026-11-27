import { getCachedPostSummaries } from "@/shared/_controllers/post/index.server";
import { toPostCardView } from "@/shared/_controllers/post";
import { BlogCardFeatured, BlogCardItem } from "@/features/post/ui/blog-cards";
import { getCachedProfile } from "@/shared/_controllers/profile/index.server";
import { getCachedProjectSummaries } from "@/shared/_controllers/project/index.server";
import { toProjectCardView } from "@/shared/_controllers/project";
import { FeaturedProjectsCarousel } from "@/features/project/ui/featured-projects-carousel";
import { Container } from "@/shared/components/container";
import { TextLink } from "@/shared/components/text-link";
import { SectionTitle } from "@/shared/components/title";
import { cn } from "@/shared/utils";
import { HeroSection } from "@/app/(public)/_components/hero-section";
import { SectionError } from "@/app/(public)/_components/section-error";

// 메인: 히어로 · 주요 프로젝트 캐러셀 · 블로그. 모든 데이터가 캐시되어 정적으로 만들어진다(설계 문서 6절).
export default async function HomePage() {
  const profile = await getCachedProfile();
  return (
    <>
      <HeroSection profile={profile} />
      <Container as="section" className="pt-10 pb-fluid-96-120">
        <FeaturedProjects />
      </Container>
      <Container as="section" className="pt-10 pb-fluid-128-200">
        <LatestPosts />
      </Container>
    </>
  );
}

async function FeaturedProjects() {
  let projects;
  try {
    projects = (await getCachedProjectSummaries()).filter((project) => project.featured).map(toProjectCardView);
  } catch {
    return (
      <div className="flex flex-col gap-10">
        <SectionHeading title="주요 프로젝트" href="/projects" linkLabel="전체 프로젝트 보기 →" />
        <SectionError title="주요 프로젝트를 불러오지 못했어요" />
      </div>
    );
  }
  return <FeaturedProjectsCarousel projects={projects} />;
}

async function LatestPosts() {
  let posts;
  try {
    posts = (await getCachedPostSummaries()).slice(0, 4).map(toPostCardView);
  } catch {
    return (
      <div className="flex flex-col gap-10">
        <SectionHeading title="블로그" tape="sage" href="/blog" linkLabel="블로그 전체 보기 →" />
        <SectionError title="블로그 글을 불러오지 못했어요" />
      </div>
    );
  }

  const [featured, ...rest] = posts;
  return (
    <div className="flex flex-col">
      <SectionHeading title="블로그" tape="sage" href="/blog" linkLabel="블로그 전체 보기 →" />
      {featured && (
        // 1024 이상은 큰 카드(520) + 오른쪽 목록(간격 56). 오른쪽은 1280 이상 3개, 그 아래는 2개.
        <div className="mt-24 flex flex-col gap-fluid-40-56 lg:flex-row">
          <BlogCardFeatured post={featured} className="lg:w-[520px] lg:shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-10 lg:justify-between">
            {rest.map((post, i) => (
              <BlogCardItem key={post.slug} post={post} className={cn(i === 2 && "hidden xl:flex")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type SectionHeadingProps = { title: string; tape?: "lilac" | "sage"; href: string; linkLabel: string };

function SectionHeading(props: SectionHeadingProps) {
  const { title, tape, href, linkLabel } = props;
  return (
    <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
      <SectionTitle tape={tape}>{title}</SectionTitle>
      <TextLink href={href}>{linkLabel}</TextLink>
    </div>
  );
}

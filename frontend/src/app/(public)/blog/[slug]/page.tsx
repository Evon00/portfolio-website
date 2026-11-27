import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCachedPostDetail, getCachedPostSummaries } from "@/shared/_controllers/post/index.server";
import { ViewCount } from "@/features/post/ui/view-count";
import { ArticleFooter } from "@/shared/components/back-button";
import { Container } from "@/shared/components/container";
import { Icon } from "@/shared/components/icon";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { RelativeTime } from "@/shared/components/relative-time";
import { SkillTagList } from "@/shared/components/skill";
import { TextLink } from "@/shared/components/text-link";
import { ScrollTopLink } from "@/shared/components/scroll-top-link";

// 기존 글은 빌드 때 미리 만들고, 새 글은 첫 요청 때 만든 뒤 캐시한다(설계 문서 6절).
// Cache Components에서는 빈 배열이면 빌드 오류라, 글이 없을 때는 자리표시 slug 하나를 돌려주고 notFound로 처리한다.
const PLACEHOLDER_SLUG = "__placeholder__";

export async function generateStaticParams() {
  const posts = await getCachedPostSummaries();
  return posts.length > 0 ? posts.map((post) => ({ slug: post.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getCachedPostDetail(slug);
  if (!detail) return {};
  return { title: detail.post.title, description: detail.post.summary };
}

// 목록에 없던 새 slug는 앱 셸(아래 fallback)을 먼저 보내고 본문을 이어서 그린다(Partial Prefetching).
// params는 Suspense 안에서만 읽는다(설계 문서 6절, Next 문서 incremental-static-regeneration-cache-components).
export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<Container size="narrow" className="min-h-[60vh] pt-fluid-24-40" />}>
      <BlogPostPageContent params={params} />
    </Suspense>
  );
}

async function BlogPostPageContent({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const detail = slug === PLACEHOLDER_SLUG ? null : await getCachedPostDetail(slug);
  if (!detail) notFound();
  const { post, html } = detail;

  return (
    <article>
      {/* Figma 블로그 상세 › post heading (폭 780) */}
      <Container size="narrow" className="pt-fluid-24-40">
        <TextLink href="/blog">← 블로그 목록</TextLink>
        <h1 className="mt-9 font-display text-title-1 text-content-01 md:text-display-s">{post.title}</h1>
        <SkillTagList skills={post.skills} className="mt-4 gap-2" />
        <div className="mt-3.5 flex flex-wrap items-center gap-x-[18px] gap-y-2 text-body-m text-content-02">
          <span className="flex items-center gap-1.5">
            <Icon name="clock" size={16} />
            <RelativeTime dateTime={post.publishedAt} />
          </span>
          <ViewCount postId={post.postId} initialCount={post.viewCount} />
        </div>
        <p className="mt-[22px] rounded-2xl border border-line-01 bg-background-01 px-[25px] py-[22px] text-body-article text-content-01">
          {post.summary}
        </p>
      </Container>

      {/* cover: 썸네일(본문 첫 이미지)이 있을 때만. 세이지 캐릭터가 뒤에서 걸쳐 있다. */}
      {post.thumbnailUrl && (
        <Container size="narrow" className="pt-[104px] pb-[60px]">
          <div className="relative">
            <PaperAsset name="blob-sage-smile" className="-top-[58px] left-10 h-[105.75px] w-[160px]" />
            <div className="relative aspect-video overflow-hidden rounded-pill bg-background-04">
              <Image
                src={post.thumbnailUrl}
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 860px) 780px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      )}

      <Container size="narrow" className={post.thumbnailUrl ? "pb-40" : "pt-14 pb-40"}>
        {/* 렌더러가 만든 HTML. 원시 HTML을 허용하지 않는 파이프라인이라 그대로 넣는다. */}
        <div className="prose prose-blog" dangerouslySetInnerHTML={{ __html: html }} />
        <ArticleFooter backHref="/blog" end={<ScrollTopLink />} className="mt-14" />
      </Container>
    </article>
  );
}

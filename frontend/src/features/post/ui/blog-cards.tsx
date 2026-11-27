import Link from "next/link";
import { CARD_FOCUS_RING, CARD_LINK } from "@/shared/components/card-link";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { PostMeta } from "@/shared/components/post-meta";
import { SkillTagRow } from "@/shared/components/skill-tag-row";
import { cn } from "@/shared/utils";
import type { PostCardView } from "@/shared/_controllers/post";
import { PostThumbnail } from "./post-thumbnail";

// 카드 전체를 누를 수 있게 제목 링크를 카드 크기로 늘린다(프로젝트 카드와 같은 방식, card-link.ts).

// Figma Components › Blog Card / Featured. 메인 블로그: 최신 글 1개 크게.
// 썸네일 뒤로 세이지 캐릭터가 걸쳐 있다.
export function BlogCardFeatured({ post, className }: { post: PostCardView; className?: string }) {
  return (
    <article className={cn("group relative flex min-w-0 flex-col gap-5", CARD_FOCUS_RING, className)}>
      <div className="relative">
        <PaperAsset name="blob-sage-smile" className="-top-[86px] left-7 h-[112.36px] w-[170px]" />
        <PostThumbnail
          src={post.thumbnailUrl}
          ratio="16:10"
          sizes="(min-width: 1280px) 520px, 90vw"
          className="rounded-pill border-2 border-transparent transition-colors group-hover:border-primary-muted"
        />
      </div>
      <div className="flex flex-col gap-2.5 px-1">
        <h3 className="truncate font-display text-title-2 text-content-01 transition-colors group-hover:text-primary-strong">
          <Link href={`/blog/${post.slug}`} data-card-link className={CARD_LINK}>
            {post.title}
          </Link>
        </h3>
        <p className="truncate text-body-l text-content-02">{post.summary}</p>
        <PostMeta publishedAt={post.publishedAt} viewCount={post.viewCount} className="text-body-m" />
        <SkillTagRow skills={post.skills} />
      </div>
    </article>
  );
}

// Figma Components › Blog Card / Item. 메인 블로그: 다음 최신 글.
// Figma 메인은 모든 폭에서 S(142px 썸네일, 간격 16)를 쓴다. L(160)은 쓰는 화면이 없어 만들지 않았다.
export function BlogCardItem({ post, className }: { post: PostCardView; className?: string }) {
  return (
    <article className={cn("group relative flex min-w-0 items-start gap-4", CARD_FOCUS_RING, className)}>
      <PostThumbnail
        src={post.thumbnailUrl}
        ratio="1:1"
        sizes="160px"
        className="w-[142px] shrink-0 rounded-2xl border-2 border-transparent transition-colors group-hover:border-primary-muted"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        <h3 className="truncate font-display text-title-3 text-content-01 transition-colors group-hover:text-primary-strong">
          <Link href={`/blog/${post.slug}`} data-card-link className={CARD_LINK}>
            {post.title}
          </Link>
        </h3>
        <p className="truncate text-body-m text-content-02">{post.summary}</p>
        <PostMeta publishedAt={post.publishedAt} viewCount={post.viewCount} className="text-caption" />
        <SkillTagRow skills={post.skills} />
      </div>
    </article>
  );
}

// Figma Components › Blog Row. 블로그 목록 행. 1024 이상 Row, 미만 Stack(썸네일 위).
// Hover: 제목 → primary-strong · 썸네일 테두리 → primary-muted.
export function BlogRow({ post, className }: { post: PostCardView; className?: string }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-fluid-18-28 border-b border-dashed border-line-02 py-fluid-28-32 lg:flex-row",
        CARD_FOCUS_RING,
        className,
      )}
    >
      <PostThumbnail
        src={post.thumbnailUrl}
        ratio="16:10"
        sizes="(min-width: 1024px) 260px, 90vw"
        className="rounded-2xl border-2 border-transparent transition-colors group-hover:border-primary-muted lg:w-[260px] lg:shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <h3 className="truncate font-display text-title-3 text-content-01 transition-colors group-hover:text-primary-strong">
          <Link href={`/blog/${post.slug}`} data-card-link className={CARD_LINK}>
            {post.title}
          </Link>
        </h3>
        <p className="truncate text-body-m text-content-02 lg:text-body-l">{post.summary}</p>
        <PostMeta publishedAt={post.publishedAt} viewCount={post.viewCount} className="text-body-m" />
        <SkillTagRow skills={post.skills} />
      </div>
    </article>
  );
}

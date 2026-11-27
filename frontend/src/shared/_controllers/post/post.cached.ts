import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS, isApiError } from "@/shared/libs/api";
import { renderMarkdown } from "@/shared/libs/markdown/render";
import { getPostBySlug, getPostSummaries } from "./post.service";

// 공개 페이지 캐시 (설계 문서 6절). 수정이 없으면 캐시를 그대로 내보내고, 저장·삭제 때 서버 액션이 태그를 비운다.
// 무효화가 빠져도 목록은 hours, 상세는 days 주기로 다시 만든다.

/** 블로그 목록·메인 블로그 섹션이 쓰는 전체 요약 목록 */
export async function getCachedPostSummaries() {
  "use cache";
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.skills);
  cacheLife("hours");
  return getPostSummaries();
}

/** 상세 + 렌더링된 본문 HTML. 커버로 쓴 첫 이미지는 본문에서 뺀다. */
export async function getCachedPostDetail(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.skills);
  cacheLife("days");
  // 없는 글은 404로 오고, 화면(notFound)이 쓰도록 여기 한 곳에서만 null로 바꾼다.
  const post = await getPostBySlug({ slug }).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  });
  if (!post) {
    // 없는 slug의 결과(null)도 캐시되므로 목록 태그를 붙여, 그 slug로 등록 · 수정 · 삭제하면(목록 태그를 비운다) 바로 다시 찾게 한다.
    cacheTag(CACHE_TAGS.posts);
    return null;
  }
  // slug로 찾지만 무효화는 id 기준이라 응답을 받은 뒤 태그를 붙인다.
  cacheTag(CACHE_TAGS.post(post.postId));
  const html = await renderMarkdown(post.content, { omitLeadingImage: Boolean(post.thumbnailUrl) });
  return { post, html };
}

import type { PostSummaryResponse } from "@/shared/_generated";
import type { SkillView } from "@/shared/components/skill";

// 게시글 화면용 타입과, 그 타입을 만드는 변환·검색 함수.

/** 블로그 카드·행이 그리는 데 필요한 값 */
export type PostCardView = {
  slug: string;
  title: string;
  summary: string;
  /** ISO 8601 */
  publishedAt: string;
  viewCount: number;
  skills: SkillView[];
  thumbnailUrl: string | null;
};

export function toPostCardView(post: PostSummaryResponse): PostCardView {
  return {
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    publishedAt: post.publishedAt,
    viewCount: post.viewCount,
    thumbnailUrl: post.thumbnailUrl,
    skills: post.skills.map((skill) => ({ name: skill.name, iconUrl: skill.iconUrl })),
  };
}

// 블로그 목록 검색 조건·정렬. "내용"은 요약(summary)에서 찾는다 (설계 문서 6절).
export const SEARCH_SCOPES = [
  { value: "title", label: "제목" },
  { value: "content", label: "내용" },
  { value: "title-content", label: "제목+내용" },
  { value: "skill", label: "스킬" },
] as const;

export type SearchScope = (typeof SEARCH_SCOPES)[number]["value"];

export const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회순" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

type SearchablePost = {
  title: string;
  summary: string;
  publishedAt: string;
  viewCount: number;
  skills: { name: string }[];
};

/** 검색어·조건으로 거르고 정렬한다. 블로그 목록과 어드민 게시글 목록이 같이 쓴다. */
export function filterPosts<T extends SearchablePost>(
  posts: T[],
  keyword: string,
  scope: SearchScope,
  sort: SortOption,
) {
  const k = keyword.trim().toLowerCase();
  const matches = (post: T) => {
    const inTitle = post.title.toLowerCase().includes(k);
    const inSummary = post.summary.toLowerCase().includes(k);
    if (scope === "title") return inTitle;
    if (scope === "content") return inSummary;
    if (scope === "title-content") return inTitle || inSummary;
    return post.skills.some((skill) => skill.name.toLowerCase().includes(k));
  };
  return (k ? posts.filter(matches) : posts).toSorted((a, b) =>
    sort === "views" ? b.viewCount - a.viewCount : b.publishedAt.localeCompare(a.publishedAt),
  );
}

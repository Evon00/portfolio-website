import type {
  FindAllAdminPostsItem,
  FindAllPostsItem,
  FindAllPostsQuery,
  FindPostBySlugResponseDto,
  FindPostResponseDto,
  PostSkillItem,
} from "@/shared/_generated";
import type { SkillView } from "@/shared/components/skill";

// 게시글 화면용 타입과, 그 타입을 만드는 변환 함수. 검색·정렬·페이지는 Spring이 한다.

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

/** 공개 상세 */
export type PostDetailView = PostCardView & { postId: number; content: string };

/** 어드민 목록 한 줄 */
export type PostRowView = Pick<PostCardView, "slug" | "title" | "publishedAt" | "viewCount" | "skills"> & {
  postId: number;
};

/** 본문에 넣은 이미지. 저장할 때 본문에 남아 있는 이미지의 id를 보낸다. */
export type PostMediaView = { id: number; url: string };

/** 어드민 수정 화면 */
export type PostEditView = {
  postId: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  /** 노출 순서대로 */
  skillIds: number[];
  medias: PostMediaView[];
};

/** 목록 한 쪽. page는 1부터. */
export type PostPage<T> = { items: T[]; page: number; totalPages: number; totalElements: number };

function toSkillView(skill: PostSkillItem): SkillView {
  return { name: skill.skillName, iconUrl: skill.skillUrl };
}

export function toPostCardView(post: FindAllPostsItem): PostCardView {
  return {
    slug: post.postSlug,
    title: post.postTitle,
    summary: post.postSummary,
    publishedAt: post.createdAt,
    viewCount: post.postView,
    thumbnailUrl: post.postThumbnailUrl,
    skills: post.skills.map(toSkillView),
  };
}

export function toPostDetailView(post: FindPostBySlugResponseDto): PostDetailView {
  return {
    postId: post.postId,
    slug: post.postSlug,
    title: post.postTitle,
    summary: post.postSummary,
    content: post.postContent,
    publishedAt: post.createdAt,
    viewCount: post.postView,
    thumbnailUrl: post.postThumbnailUrl,
    skills: post.skills.map(toSkillView),
  };
}

export function toPostRowView(post: FindAllAdminPostsItem): PostRowView {
  return {
    postId: post.postId,
    slug: post.postSlug,
    title: post.postTitle,
    publishedAt: post.createdAt,
    viewCount: post.postView,
    skills: post.skills.map(toSkillView),
  };
}

export function toPostEditView(post: FindPostResponseDto): PostEditView {
  return {
    postId: post.postId,
    title: post.postTitle,
    slug: post.postSlug,
    summary: post.postSummary,
    content: post.postContent,
    skillIds: post.skills.map((skill) => skill.skillId),
    medias: post.postMedias.map((media) => ({ id: media.postMediaId, url: media.postMediaUrl })),
  };
}

/** Spring 페이지 응답 → 화면 쪽(1부터) */
export function toPostPage<S, T>(
  page: { content: S[]; pageNumber: number; totalPages: number; totalElements: number },
  convert: (item: S) => T,
): PostPage<T> {
  return {
    items: page.content.map(convert),
    page: page.pageNumber + 1,
    totalPages: Math.max(1, page.totalPages),
    totalElements: page.totalElements,
  };
}

// 블로그 목록 검색 조건·정렬. "내용"은 본문에서 찾는다(Spring).
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

/** 한 쪽에 보이는 글 수 (Figma 블로그 목록 · 관리자 게시글 목록) */
export const BLOG_PAGE_SIZE = 5;
export const ADMIN_POST_PAGE_SIZE = 5;

/** 화면의 목록 조건. page는 1부터. */
export type PostListFilters = { keyword: string; scope: SearchScope; sort: SortOption; page: number; size: number };

const KEYWORD_TYPE: Record<SearchScope, NonNullable<FindAllPostsQuery["keywordType"]>> = {
  title: "TITLE",
  content: "CONTENT",
  "title-content": "TITLE_CONTENT",
  skill: "SKILL",
};

/** 화면 조건 → Spring 목록 쿼리(공개·어드민 같은 모양) */
export function toPostListQuery(filters: PostListFilters): FindAllPostsQuery {
  const keyword = filters.keyword.trim();
  return {
    pageNumber: Math.max(0, filters.page - 1),
    pageSize: filters.size,
    sortBy: filters.sort === "views" ? "postView" : "createdAt",
    sortDir: "desc",
    ...(keyword ? { keyword, keywordType: KEYWORD_TYPE[filters.scope] } : {}),
  };
}

const isScope = (value: string | null): value is SearchScope => SEARCH_SCOPES.some((item) => item.value === value);
const isSort = (value: string | null): value is SortOption => SORT_OPTIONS.some((item) => item.value === value);

/** 주소 쿼리(q · scope · sort · page) → 목록 조건. 잘못된 값은 기본값으로 바꾼다. */
export function readPostListFilters(params: URLSearchParams, size: number): PostListFilters {
  const scope = params.get("scope");
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  return {
    keyword: (params.get("q") ?? "").slice(0, 100),
    scope: isScope(scope) ? scope : "title",
    sort: isSort(sort) ? sort : "latest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    size,
  };
}

import "server-only";

import { ApiError } from "@/shared/libs/api";
import type {
  DeletePostPath,
  GetPostByIdPath,
  GetPostBySlugPath,
  IncreasePostViewPath,
  IsPostSlugAvailableQuery,
  PostDetailResponse,
  PostSaveRequest,
  PostSummaryResponse,
  SlugCheckResponse,
  UpdatePostPath,
  ViewCountResponse,
} from "@/shared/_controllers/_legacy-types";
import { type MockPost, mockDb, mockDelay, nextMockId, resolveSkills } from "./store";

// 게시글 목 구현(서버 메모리). 인자 · 반환 모양은 post/post.api.ts(실제 구현)와 같다(data-source.server.ts의 satisfies가 확인한다).
// data-source.server.ts가 이 파일을 고른다. Spring 연결 때 post/post.api.ts로 바꾸면 이 파일은 지운다.

/** 본문 첫 이미지 = 목록 썸네일 (Figma 게시글 작성 안내 문구) */
function firstImageUrl(markdown: string) {
  return /!\[[^\]]*\]\(([^)\s]+)/.exec(markdown)?.[1] ?? null;
}

function toDetail({ skillIds, ...post }: MockPost): PostDetailResponse {
  return { ...post, skills: resolveSkills(skillIds) };
}

function toSummary(post: MockPost): PostSummaryResponse {
  const { content: _content, updatedAt: _updatedAt, ...summary } = toDetail(post);
  return summary;
}

function findPost(postId: number) {
  const post = mockDb.posts.find((item) => item.postId === postId);
  if (!post) throw new ApiError({ status: 404, message: "게시글을 찾을 수 없어요." });
  return post;
}

/** 전체 게시글 요약(최신순). GET /api/posts */
export async function getPostSummaries(): Promise<PostSummaryResponse[]> {
  await mockDelay();
  return [...mockDb.posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map(toSummary);
}

/** 게시글 상세. GET /api/posts/slug/{slug} · 없으면 404 */
export async function getPostBySlug({ slug }: GetPostBySlugPath): Promise<PostDetailResponse> {
  await mockDelay();
  const post = mockDb.posts.find((item) => item.slug === slug);
  if (!post) throw new ApiError({ status: 404, message: "게시글을 찾을 수 없어요." });
  return toDetail(post);
}

/** 조회수 증가. POST /api/posts/{postId}/views */
export async function increasePostView({ postId }: IncreasePostViewPath): Promise<ViewCountResponse> {
  const post = findPost(postId);
  post.viewCount += 1;
  return { viewCount: post.viewCount };
}

// ── 어드민 ──

/** 수정 화면. GET /api/admin/posts/{postId} */
export async function getPostById({ postId }: GetPostByIdPath): Promise<PostDetailResponse> {
  await mockDelay();
  return toDetail(findPost(postId));
}

/** 슬러그 중복 확인. GET /api/admin/posts/slug-check?slug= */
export async function isPostSlugAvailable({ slug }: IsPostSlugAvailableQuery): Promise<SlugCheckResponse> {
  await mockDelay();
  return { available: !mockDb.posts.some((post) => post.slug === slug) };
}

/** 등록. POST /api/admin/posts */
export async function createPost(request: PostSaveRequest): Promise<PostDetailResponse> {
  await mockDelay();
  if (!(await isPostSlugAvailable({ slug: request.slug })).available) {
    throw new ApiError({ status: 409, message: "이미 쓰고 있는 슬러그예요." });
  }
  const now = new Date().toISOString();
  const { skillIds, ...fields } = request;
  const post: MockPost = {
    ...fields,
    postId: nextMockId(),
    thumbnailUrl: firstImageUrl(request.content),
    viewCount: 0,
    publishedAt: now,
    updatedAt: now,
    skillIds,
  };
  mockDb.posts.push(post);
  return toDetail(post);
}

/** 수정. PUT /api/admin/posts/{postId} · 슬러그는 바꾸지 않는다 */
export async function updatePost({ postId }: UpdatePostPath, request: PostSaveRequest): Promise<PostDetailResponse> {
  await mockDelay();
  const post = findPost(postId);
  Object.assign(post, {
    title: request.title,
    summary: request.summary,
    content: request.content,
    skillIds: request.skillIds,
    thumbnailUrl: firstImageUrl(request.content),
    updatedAt: new Date().toISOString(),
  });
  return toDetail(post);
}

/** 삭제. DELETE /api/admin/posts/{postId} */
export async function deletePost({ postId }: DeletePostPath) {
  await mockDelay();
  findPost(postId);
  mockDb.posts = mockDb.posts.filter((post) => post.postId !== postId);
}

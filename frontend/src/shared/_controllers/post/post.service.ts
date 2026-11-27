import "server-only";

import { post } from "@/shared/_controllers/data-source.server";

// 게시글 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(지금은 _mock/post.ts, Spring 연결 후 post.api.ts). 주석의 경로는 예정 엔드포인트다.

/** 전체 게시글 요약(최신순). GET /api/posts */
export const getPostSummaries = post.getPostSummaries;

/** 게시글 상세. GET /api/posts/slug/{slug} · 없으면 404(post.cached.ts가 null로 바꾼다) */
export const getPostBySlug = post.getPostBySlug;

/** 조회수 증가. POST /api/posts/{postId}/views */
export const increasePostView = post.increasePostView;

/** 수정 화면. GET /api/admin/posts/{postId} */
export const getPostById = post.getPostById;

/** 슬러그 중복 확인. GET /api/admin/posts/slug-check?slug= */
export const isPostSlugAvailable = post.isPostSlugAvailable;

/** 등록. POST /api/admin/posts */
export const createPost = post.createPost;

/** 수정. PUT /api/admin/posts/{postId} · 슬러그는 바꾸지 않는다 */
export const updatePost = post.updatePost;

/** 삭제. DELETE /api/admin/posts/{postId} */
export const deletePost = post.deletePost;

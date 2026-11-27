import "server-only";

import { post, postView } from "@/shared/_controllers/data-source.server";

// 게시글 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓴다.

/** 공개 목록(페이지·정렬·검색). GET /api/post */
export const findAllPosts = post.findAllPosts;

/** 공개 상세. GET /api/post/{postSlug} · 없으면 404(post.cached.ts가 null로 바꾼다) · 조회수는 올리지 않는다 */
export const findPostBySlug = post.findPostBySlug;

/** 조회수 증가(같은 IP는 24시간에 1회). POST /api/post/{postId}/view */
export const increasePostView = postView.increasePostView;

/** 어드민 목록(페이지·정렬·검색). GET /api/admin/post */
export const findAllAdminPosts = post.findAllAdminPosts;

/** 수정 화면. GET /api/admin/post/{postId} */
export const findPost = post.findPost;

/** 슬러그 중복 확인. GET /api/admin/post/slug/check?postSlug= */
export const checkPostSlug = post.checkPostSlug;

/** 본문 이미지 업로드(multipart `file`). POST /api/admin/post/image · 받은 postMediaId를 등록·수정 때 보낸다 */
export const uploadPostImage = post.uploadPostImage;

/** 등록. POST /api/admin/post */
export const createPost = post.createPost;

/** 수정(보낸 필드만). PATCH /api/admin/post/{postId} · 슬러그는 바꾸지 않는다 */
export const updatePost = post.updatePost;

/** 삭제. DELETE /api/admin/post/{postId} */
export const deletePost = post.deletePost;

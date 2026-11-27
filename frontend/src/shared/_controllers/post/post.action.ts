"use server";

import type { PostSaveRequest, ViewCountResponse } from "@/shared/_generated";
import { type ApiResult, apiFailure, apiSuccess } from "@/shared/libs/api";
import { invalidatePost } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { createPost, deletePost, increasePostView, updatePost } from "./post.service";

// 공개 서버 액션: 조회수 증가. 캐시하지 않는다.
// 반복 호출 제한은 Spring에서 한다(설계 문서 16-1절). 프론트의 sessionStorage 방지는 편의 기능이다.
export async function increasePostViewAction(postId: number): Promise<ApiResult<ViewCountResponse>> {
  try {
    return apiSuccess(await increasePostView({ postId }));
  } catch (error) {
    return apiFailure(error);
  }
}

// 어드민 게시글 저장·삭제. 성공하면 공개 페이지 캐시(post-<id>, posts)를 비운다(설계 문서 6절).

export async function createPostAction(request: PostSaveRequest) {
  return withAdminAction(async () => {
    const post = await createPost(request);
    invalidatePost(post.postId);
    return post;
  });
}

export async function updatePostAction(postId: number, request: PostSaveRequest) {
  return withAdminAction(async () => {
    const post = await updatePost({ postId }, request);
    invalidatePost(postId);
    return post;
  });
}

export async function deletePostAction(postId: number) {
  return withAdminAction(async () => {
    await deletePost({ postId });
    invalidatePost(postId);
    return null;
  });
}

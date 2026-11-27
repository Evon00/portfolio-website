"use server";

import { headers } from "next/headers";
import type { CreatePostRequestDto, UpdatePostRequestDto } from "@/shared/_generated";
import { type ApiResult, apiFailure, apiSuccess } from "@/shared/libs/api";
import { invalidatePost } from "@/shared/libs/api/invalidate";
import { withAdminAction } from "@/shared/libs/auth/guard";
import { createPost, deletePost, increasePostView, updatePost, uploadPostImage } from "./post.service";
import type { PostMediaView } from "./post.types";

/**
 * 방문자 IP. 운영에서는 nginx가 넣는 X-Real-IP를 쓰고, 없으면 X-Forwarded-For의 마지막 값(바로 앞 프록시가 붙인 값)을 쓴다.
 * 앞쪽 값은 방문자가 마음대로 넣을 수 있어 쓰지 않는다.
 */
function visitorIp(requestHeaders: Headers) {
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return forwarded?.at(-1) ?? null;
}

// 공개 서버 액션: 조회수 증가. 캐시하지 않는다.
// 반복 증가 제한(같은 IP 24시간 1회)은 Spring이 한다. 프론트의 sessionStorage 방지는 요청을 줄이는 편의 기능이다.
export async function increasePostViewAction(postId: number): Promise<ApiResult<{ viewCount: number }>> {
  try {
    const requestHeaders = await headers();
    const { postView } = await increasePostView(
      { postId },
      { ip: visitorIp(requestHeaders), userAgent: requestHeaders.get("user-agent") },
    );
    return apiSuccess({ viewCount: postView });
  } catch (error) {
    return apiFailure(error);
  }
}

// 어드민 게시글 저장·삭제. 성공하면 공개 페이지 캐시(post-<id>, posts)를 비운다(설계 문서 6절).

/**
 * 본문 이미지 업로드. 화면은 브라우저에서 변환한 이미지를 FormData(`image`)로 보내고, 여기서 Spring multipart(`file`)로 바꾼다.
 * 올린 이미지는 게시글에 아직 연결되지 않은 상태다. 등록·수정 때 본문에 남은 이미지의 id를 보내 연결한다.
 */
export async function uploadPostImageAction(form: FormData) {
  return withAdminAction(async (): Promise<PostMediaView> => {
    const image = form.get("image");
    const body = new FormData();
    if (image instanceof Blob && image.size > 0) body.append("file", image);
    const uploaded = await uploadPostImage(body);
    return { id: uploaded.postMediaId, url: uploaded.postMediaUrl };
  });
}

export async function createPostAction(request: CreatePostRequestDto) {
  return withAdminAction(async () => {
    const post = await createPost(request);
    invalidatePost(post.postId);
    return post;
  });
}

/** 바뀐 필드만 담아 보낸다(Spring PATCH). */
export async function updatePostAction(postId: number, changes: UpdatePostRequestDto) {
  return withAdminAction(async () => {
    const post = await updatePost({ postId }, changes);
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

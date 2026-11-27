"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { PostDetailResponse, PostSummaryResponse } from "@/shared/_generated";

// 어드민 게시글 조회 (라우트 핸들러). 저장·삭제는 post.action.ts의 서버 액션을 쓴다.
export function usePostListQuery() {
  return useQuery({
    queryKey: adminQueryKeys.posts.lists(),
    queryFn: () => adminFetch<PostSummaryResponse[]>("/api/admin/posts"),
  });
}

export function usePostDetailQuery(postId: number) {
  return useQuery({
    queryKey: adminQueryKeys.posts.detail(postId),
    queryFn: () => adminFetch<PostDetailResponse>(`/api/admin/posts/${postId}`),
  });
}

"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminFetch, adminQueryKeys } from "@/shared/libs/api";
import type { PostEditView, PostListFilters, PostPage, PostRowView } from "./post.types";

// 어드민 게시글 조회 (라우트 핸들러). 저장·삭제는 post.action.ts의 서버 액션을 쓴다.

/** 목록 한 쪽. 조건을 바꾸는 동안 이전 쪽을 그대로 보여 준다. */
export function usePostListQuery(filters: PostListFilters) {
  const query = new URLSearchParams({
    q: filters.keyword,
    scope: filters.scope,
    sort: filters.sort,
    page: String(filters.page),
  });
  return useQuery({
    queryKey: adminQueryKeys.posts.list(filters),
    queryFn: () => adminFetch<PostPage<PostRowView>>(`/api/admin/posts?${query}`),
    placeholderData: keepPreviousData,
  });
}

export function usePostDetailQuery(postId: number) {
  return useQuery({
    queryKey: adminQueryKeys.posts.detail(postId),
    queryFn: () => adminFetch<PostEditView>(`/api/admin/posts/${postId}`),
  });
}

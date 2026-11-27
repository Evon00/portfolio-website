"use client";

import { use } from "react";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { usePostDetailQuery } from "@/shared/_controllers/post";
import { PostForm } from "./post-form";

// 수정 화면: 글을 불러온 뒤 폼을 그린다(폼 state의 초기값).
export function PostEdit({ params }: { params: Promise<{ id: string }> }) {
  const postId = Number(use(params).id);
  const { data, isPending, isError, refetch } = usePostDetailQuery(postId);
  if (isPending) return <AdminLoading />;
  if (isError) return <AdminLoadError onRetry={() => refetch()} />;
  return <PostForm key={data.postId} post={data} />;
}

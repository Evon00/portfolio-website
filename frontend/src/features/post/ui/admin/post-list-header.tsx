"use client";

import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { Button } from "@/shared/components/button";
import { usePostListQuery } from "@/shared/_controllers/post";

export function PostListHeader() {
  const { data } = usePostListQuery();
  return (
    <AdminPageHeader
      title="게시글"
      count={data?.length}
      actions={
        <Button href="/admin/posts/new" size="M">
          + 새 게시글
        </Button>
      }
    />
  );
}

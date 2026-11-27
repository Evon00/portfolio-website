"use client";

import { AdminPageHeader } from "@/shared/components/admin/page-header";
import { Button } from "@/shared/components/button";
import { usePostListQuery } from "@/shared/_controllers/post";
import { DEFAULT_POST_FILTERS } from "./post-table";

export function PostListHeader() {
  const { data } = usePostListQuery(DEFAULT_POST_FILTERS);
  return (
    <AdminPageHeader
      title="게시글"
      count={data?.totalElements}
      actions={
        <Button href="/admin/posts/new" size="M">
          + 새 게시글
        </Button>
      }
    />
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { PostEdit } from "@/features/post/ui/admin/post-edit";
import { AdminLoading } from "@/shared/components/admin/state";

export const metadata: Metadata = { title: "게시글 수정" };

// 어드민은 브라우저에서 조회한다. 경로의 id는 클라이언트에서 꺼내 쓴다.
export default function EditPostPage({ params }: PageProps<"/admin/posts/[id]/edit">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <PostEdit params={params} />
    </Suspense>
  );
}

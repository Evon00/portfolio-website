import type { Metadata } from "next";
import { PostListHeader } from "@/features/post/ui/admin/post-list-header";
import { PostTable } from "@/features/post/ui/admin/post-table";

export const metadata: Metadata = { title: "게시글" };

export default function AdminPostsPage() {
  return (
    <>
      <PostListHeader />
      <PostTable />
    </>
  );
}

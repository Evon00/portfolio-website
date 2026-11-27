import type { Metadata } from "next";
import { PostForm } from "@/features/post/ui/admin/post-form";

export const metadata: Metadata = { title: "새 게시글" };

export default function NewPostPage() {
  return <PostForm />;
}

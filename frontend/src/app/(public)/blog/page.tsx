import type { Metadata } from "next";
import { getCachedPostSummaries } from "@/shared/_controllers/post/index.server";
import { toPostCardView } from "@/shared/_controllers/post";
import { BlogExplorer } from "@/features/post/ui/blog-explorer";

export const metadata: Metadata = { title: "블로그" };

export default async function BlogPage() {
  const posts = (await getCachedPostSummaries()).map(toPostCardView);
  return <BlogExplorer posts={posts} />;
}

import type { Metadata } from "next";
import { getCachedPostPage } from "@/shared/_controllers/post/index.server";
import { BLOG_PAGE_SIZE } from "@/shared/_controllers/post";
import { BlogExplorer } from "@/features/post/ui/blog-explorer";

export const metadata: Metadata = { title: "블로그" };

// 첫 화면(최신순 1쪽)만 서버에서 캐시해 그린다. 검색·정렬·쪽 이동은 BlogExplorer가 /api/posts로 받는다.
export default async function BlogPage() {
  const initial = await getCachedPostPage({
    keyword: "",
    scope: "title",
    sort: "latest",
    page: 1,
    size: BLOG_PAGE_SIZE,
  });
  return <BlogExplorer initial={initial} />;
}

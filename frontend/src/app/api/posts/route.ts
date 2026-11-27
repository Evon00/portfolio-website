import { getCachedPostPage } from "@/shared/_controllers/post/index.server";
import { BLOG_PAGE_SIZE, readPostListFilters } from "@/shared/_controllers/post";

// 공개 블로그 목록 한 쪽: GET /api/posts?q=&scope=&sort=&page=
// 블로그 화면이 검색·정렬·쪽을 바꿀 때 브라우저에서 부른다. 첫 화면(기본 조건)은 페이지가 직접 그린다.
// 조건별 결과는 getCachedPostPage가 캐시하고, 글을 저장·삭제하면 posts 태그로 함께 비워진다.
export async function GET(request: Request) {
  const filters = readPostListFilters(new URL(request.url).searchParams, BLOG_PAGE_SIZE);
  try {
    return Response.json(await getCachedPostPage(filters));
  } catch {
    return Response.json({ message: "블로그 글을 불러오지 못했어요." }, { status: 502 });
  }
}

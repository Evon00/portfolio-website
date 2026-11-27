"use client";

import { useEffect, useState } from "react";
import { useUrlState } from "@/shared/hooks";
import { Container } from "@/shared/components/container";
import { EmptyState } from "@/shared/components/empty-state";
import { ListHeading, TotalCount } from "@/shared/components/list-heading";
import { Pagination } from "@/shared/components/pagination";
import { InlineError } from "@/shared/components/inline-error";
import { type PostCardView, type PostPage, type SearchScope, type SortOption } from "@/shared/_controllers/post";
import { BlogRow } from "./blog-cards";
import { SearchBar } from "./search-bar";
import { SearchScopeChips } from "./search-scope-chips";
import { SortToggle } from "./sort-toggle";

// 블로그 목록: 검색·정렬·페이지는 Spring이 한다. 첫 화면(기본 조건)은 서버가 그린 initial을 쓰고,
// 조건을 바꾸면 공개 Route Handler(/api/posts, 조건별 캐시)에서 그 쪽을 받아 온다. 받는 동안은 앞 화면을 그대로 둔다.
// "내용" 검색은 본문에서 찾는다. 한 페이지 5개.
// 768 미만: 검색바 아래 검색 조건 칩, 글 수와 정렬은 그 아래 한 줄 (Figma 블로그 목록 · 375).
const DEFAULTS = { q: "", scope: "title", sort: "latest", page: "1" };

type Loaded = { key: string; data: PostPage<PostCardView> | null };

export function BlogExplorer({ initial }: { initial: PostPage<PostCardView> }) {
  const [state, update] = useUrlState(DEFAULTS);
  const scope = state.scope as SearchScope;
  const sort = state.sort as SortOption;
  // 입력 중인 검색어. 검색 버튼(또는 Enter)을 눌러야 목록에 반영된다.
  const [draft, setDraft] = useState(state.q);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(state.q);
  }, [state.q]);

  const keyword = state.q.trim();
  const requestedPage = Math.max(1, Number(state.page) || 1);
  // 검색어가 없으면 검색 범위는 결과에 영향이 없으므로 기본 조건으로 본다.
  const isDefault = !keyword && sort === "latest" && requestedPage === 1;
  const query = new URLSearchParams({ q: keyword, scope, sort, page: String(requestedPage) }).toString();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (isDefault) return;
    const controller = new AbortController();
    fetch(`/api/posts?${query}`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<PostPage<PostCardView>>) : Promise.reject()))
      .then((data) => setLoaded({ key: query, data }))
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ key: query, data: null });
      });
    return () => controller.abort();
  }, [isDefault, query, retry]);

  const failed = !isDefault && loaded?.key === query && !loaded.data;
  // 새 쪽을 받기 전에는 앞 화면을 그대로 보여 준다(깜빡임 방지).
  const result = isDefault ? initial : (loaded?.data ?? initial);
  const totalPages = result.totalPages;
  const page = Math.min(requestedPage, totalPages);
  const visible = result.items;
  const count = <TotalCount count={result.totalElements} unit="개의 글" />;

  const search = (q = draft) => update({ q, page: "1" });
  const reset = () => {
    setDraft("");
    update({ q: "", scope: "title", page: "1" });
  };

  return (
    <>
      <Container className="pt-fluid-40-56">
        <ListHeading
          title="블로그"
          tape="sage"
          count={<div className="hidden md:block">{count}</div>}
          character={{ name: "blob-sage-smile", className: "aspect-[170/112.36] w-fluid-120-170" }}
        />
      </Container>

      <Container className="pt-fluid-24-40">
        <div className="flex flex-col gap-fluid-12-24 rounded-pill border border-line-01 bg-background-01 px-fluid-16-17 py-fluid-16-19 md:flex-row md:items-center">
          <SearchBar
            scope={scope}
            keyword={draft}
            onScopeChange={(next) => update({ scope: next, page: "1" })}
            onKeywordChange={(next) => {
              setDraft(next);
              if (next === "") search("");
            }}
            onSubmit={() => search()}
            hideScope
            className="flex-1 md:hidden"
          />
          <SearchBar
            scope={scope}
            keyword={draft}
            onScopeChange={(next) => update({ scope: next, page: "1" })}
            onKeywordChange={(next) => {
              setDraft(next);
              if (next === "") search("");
            }}
            onSubmit={() => search()}
            className="hidden flex-1 md:flex"
          />
          <SearchScopeChips
            value={scope}
            onChange={(next) => update({ scope: next, page: "1" })}
            className="md:hidden"
          />
          <SortToggle
            value={sort}
            onChange={(next) => update({ sort: next, page: "1" })}
            className="hidden md:inline-flex"
          />
        </div>
        <div className="mt-5 flex items-center justify-between md:hidden">
          {count}
          <SortToggle value={sort} onChange={(next) => update({ sort: next, page: "1" })} />
        </div>
      </Container>

      <Container className="pt-4 pb-fluid-96-120">
        {failed ? (
          <InlineError
            title="블로그 글을 불러오지 못했어요"
            description="잠시 뒤 다시 시도해 주세요."
            onRetry={() => setRetry((count) => count + 1)}
            className="mt-10"
          />
        ) : visible.length > 0 ? (
          <>
            <ul>
              {visible.map((post) => (
                <li key={post.slug}>
                  <BlogRow post={post} />
                </li>
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(next) => {
                update({ page: String(next) });
                window.scrollTo({ top: 0 });
              }}
              className="mt-10"
            />
          </>
        ) : (
          <div className="flex justify-center pt-fluid-80-104 pb-20">
            <EmptyState
              title="검색 결과가 없어요"
              description={`‘${keyword}’ 관련 글이 아직 없어요.\n다른 검색어나 검색 조건으로 찾아봐 주세요.`}
              action={{ label: "전체 글 보기", onClick: reset }}
            />
          </div>
        )}
      </Container>
    </>
  );
}

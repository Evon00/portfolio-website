"use client";

import { useEffect, useState } from "react";
import { useUrlState } from "@/shared/hooks";
import { Container } from "@/shared/components/container";
import { EmptyState } from "@/shared/components/empty-state";
import { ListHeading, TotalCount } from "@/shared/components/list-heading";
import { Pagination } from "@/shared/components/pagination";
import type { PostCardView } from "@/shared/_controllers/post";
import { filterPosts, type SearchScope, type SortOption } from "@/shared/_controllers/post";
import { BlogRow } from "./blog-cards";
import { SearchBar } from "./search-bar";
import { SearchScopeChips } from "./search-scope-chips";
import { SortToggle } from "./sort-toggle";

// 블로그 목록: 캐시된 전체 요약 목록을 받아 브라우저에서 검색·정렬·페이지를 처리한다(설계 문서 6절).
// "내용" 검색은 요약(summary)에서 찾는다. 한 페이지 5개.
// 768 미만: 검색바 아래 검색 조건 칩, 글 수와 정렬은 그 아래 한 줄 (Figma 블로그 목록 · 375).
const PAGE_SIZE = 5;
const DEFAULTS = { q: "", scope: "title", sort: "latest", page: "1" };

export function BlogExplorer({ posts }: { posts: PostCardView[] }) {
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
  const filtered = filterPosts(posts, keyword, scope, sort);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(state.page) || 1), totalPages);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const count = <TotalCount count={filtered.length} unit="개의 글" />;

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
        {visible.length > 0 ? (
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

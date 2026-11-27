"use client";

import { useEffect, useState } from "react";
import { adminQueryKeys } from "@/shared/libs/api";
import { DataTable, Td, Th, TitleSlugCell, Tr } from "@/shared/components/admin/data-table";
import { useDeleteDialog } from "@/shared/components/admin/delete-dialog";
import { AdminLoadError, AdminLoading } from "@/shared/components/admin/state";
import { ButtonCompact } from "@/shared/components/button-compact";
import { EmptyState } from "@/shared/components/empty-state";
import { Pagination } from "@/shared/components/pagination";
import { SkillTagRow } from "@/shared/components/skill-tag-row";
import { formatDate } from "@/shared/utils";
import { deletePostAction } from "@/shared/_controllers/post/post.action";
import {
  ADMIN_POST_PAGE_SIZE,
  type PostListFilters,
  type SearchScope,
  type SortOption,
  usePostListQuery,
} from "@/shared/_controllers/post";
import { SearchBar } from "@/features/post/ui/search-bar";
import { SortToggle } from "@/features/post/ui/sort-toggle";

// Figma 관리자 · 게시글 목록 / (빈 상태). 검색·정렬·페이지는 Spring이 한다(조건마다 한 쪽씩 받는다). 한 페이지 5개.
// 열(Figma 1920): 제목 / 슬러그(남는 폭) · 기술 스택 400 · 조회수 100 · 작성일 170 · 관리 180.
// 1920 미만에서는 기술 스택이 1440에서 240까지 같이 줄어든다(w-wide-240-400).
// 1280 미만에서는 기술 스택 열을 숨겨 제목이 보이게 하고, 제목 열은 최소 200(표 최소 폭 = 고정 열 450 + 200)을 지킨다.
// 읽는 시간 열은 디자인에서 뺐다.
type Filters = { scope: SearchScope; sort: SortOption; keyword: string; page: number };

/** 검색어 · 조건이 없는 첫 쪽. 헤더의 전체 글 수도 이 조건으로 읽는다. */
export const DEFAULT_POST_FILTERS: PostListFilters = {
  keyword: "",
  scope: "title",
  sort: "latest",
  page: 1,
  size: ADMIN_POST_PAGE_SIZE,
};

export function PostTable() {
  // 검색 조건(검색 범위 · 정렬 · 적용된 검색어)과 쪽. draft는 입력 중인 검색어(검색 버튼을 누르면 keyword가 된다).
  const [filters, setFilters] = useState<Filters>({ scope: "title", sort: "latest", keyword: "", page: 1 });
  const [draft, setDraft] = useState("");
  const { scope, sort, keyword, page } = filters;
  const { data, isPending, isError, refetch } = usePostListQuery({
    ...DEFAULT_POST_FILTERS,
    scope,
    sort,
    keyword: keyword.trim(),
    page,
  });
  // 마지막 쪽의 글을 지워 쪽 수가 줄면 남은 마지막 쪽으로 옮긴다.
  const totalPages = data?.totalPages ?? 1;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setFilters((current) => ({ ...current, page: totalPages }));
  }, [page, totalPages]);
  // 검색 조건을 바꾸면 1쪽으로 돌아간다.
  const changeFilters = (change: Partial<Omit<Filters, "page">>) =>
    setFilters((current) => ({ ...current, ...change, page: 1 }));
  const remove = useDeleteDialog({
    noun: "게시글",
    action: deletePostAction,
    invalidate: [adminQueryKeys.posts.all, adminQueryKeys.dashboard.all],
  });

  if (isPending) return <AdminLoading />;
  if (isError) return <AdminLoadError onRetry={() => refetch()} />;

  // 검색어 없이 0개면 글이 하나도 없는 것(빈 상태), 검색어가 있으면 검색 결과가 없는 것이다.
  const noPosts = !keyword.trim() && data.totalElements === 0;
  const current = Math.min(page, totalPages);
  const visible = data.items;

  return (
    <>
      {!noPosts && (
        <div className="flex items-center gap-6 rounded-pill border border-line-01 bg-background-01 px-[19px] py-[17px]">
          <SearchBar
            scope={scope}
            keyword={draft}
            onScopeChange={(next) => changeFilters({ scope: next })}
            onKeywordChange={(next) => {
              setDraft(next);
              if (next === "") changeFilters({ keyword: "" });
            }}
            onSubmit={() => changeFilters({ keyword: draft })}
            className="flex-1"
          />
          <SortToggle value={sort} onChange={(next) => changeFilters({ sort: next })} />
        </div>
      )}

      <DataTable className="min-w-[650px]">
        <thead>
          <tr>
            <Th>제목 / 슬러그</Th>
            <Th className="hidden w-wide-240-400 xl:table-cell">기술 스택</Th>
            <Th className="w-[100px]">조회수</Th>
            <Th className="w-[170px]">작성일</Th>
            <Th className="w-[180px]">관리</Th>
          </tr>
        </thead>
        <tbody>
          {noPosts && (
            <tr>
              <td colSpan={5} className="px-6 pt-14 pb-16">
                <div className="flex justify-center">
                  <EmptyState
                    character="mustard"
                    title="아직 쓴 글이 없어요"
                    description="첫 글을 쓰면 블로그와 메인에 바로 보여요."
                    action={{ label: "첫 글 쓰기", href: "/admin/posts/new" }}
                  />
                </div>
              </td>
            </tr>
          )}
          {visible.map((post) => (
            <Tr key={post.postId}>
              <Td>
                <TitleSlugCell title={post.title} slug={post.slug} />
              </Td>
              <Td className="hidden xl:table-cell">
                <SkillTagRow skills={post.skills} gap="md" />
              </Td>
              <Td className="text-center font-mono text-mono-l text-content-01 tabular-nums">
                {post.viewCount.toLocaleString("ko-KR")}
              </Td>
              <Td className="text-center font-mono text-mono-l text-content-01">{formatDate(post.publishedAt)}</Td>
              <Td>
                <div className="flex justify-center gap-1.5">
                  <ButtonCompact href={`/admin/posts/${post.postId}/edit`}>수정</ButtonCompact>
                  <ButtonCompact
                    variant="danger-outline"
                    onClick={() => remove.open({ id: post.postId, title: post.title })}
                  >
                    삭제
                  </ButtonCompact>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </DataTable>

      {visible.length === 0 && !noPosts ? (
        <p className="py-10 text-center text-body-m text-content-03">‘{keyword}’ 검색 결과가 없어요.</p>
      ) : (
        !noPosts && (
          <Pagination
            page={current}
            totalPages={totalPages}
            onChange={(next) => setFilters((previous) => ({ ...previous, page: next }))}
          />
        )
      )}
      {remove.dialog}
    </>
  );
}

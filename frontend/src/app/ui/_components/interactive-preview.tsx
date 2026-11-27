"use client";

import { useState } from "react";
import type { SearchScope, SortOption } from "@/shared/_controllers/post";
import { SearchBar } from "@/features/post/ui/search-bar";
import { SearchScopeChips } from "@/features/post/ui/search-scope-chips";
import { SortToggle } from "@/features/post/ui/sort-toggle";
import { Button } from "@/shared/components/button";
import { CarouselArrow, CarouselDots } from "@/shared/components/carousel-controls";
import { FilterChip } from "@/shared/components/filter-chip";
import { Select } from "@/shared/components/form";
import { ConfirmDialog, SessionExpiredDialog } from "@/shared/components/modal";
import { Pagination } from "@/shared/components/pagination";

// /ui 미리보기 중 상태가 필요한 컴포넌트.
export function InteractivePreview() {
  const [scope, setScope] = useState<SearchScope>("title");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);
  const [selectValue, setSelectValue] = useState<"latest" | "oldest" | "views">("latest");
  const [chip, setChip] = useState("all");
  const [modal, setModal] = useState<"none" | "delete" | "expired">("none");
  const [dot, setDot] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          scope={scope}
          keyword={keyword}
          onScopeChange={setScope}
          onKeywordChange={setKeyword}
          onSubmit={() => undefined}
          className="w-full max-w-[560px]"
        />
        <SortToggle value={sort} onChange={setSort} />
      </div>
      <SearchScopeChips value={scope} onChange={setScope} />
      <div className="flex flex-wrap gap-3">
        <FilterChip label="전체" selected={chip === "all"} onClick={() => setChip("all")} />
        <FilterChip
          label="Spring Boot"
          skill={{ name: "Spring Boot" }}
          selected={chip === "sb"}
          onClick={() => setChip("sb")}
        />
        <FilterChip
          label="Redis"
          skill={{ name: "Redis" }}
          selected={chip === "redis"}
          onClick={() => setChip("redis")}
        />
      </div>
      <Pagination page={page} totalPages={12} onChange={setPage} />
      <div className="flex flex-wrap items-center gap-3">
        <CarouselArrow direction="prev" />
        <CarouselArrow direction="next" />
        <CarouselArrow direction="next" disabled />
        <CarouselDots count={3} active={dot} onSelect={setDot} />
      </div>
      <Select
        label="정렬"
        value={selectValue}
        onChange={setSelectValue}
        options={[
          { value: "latest", label: "최신순" },
          { value: "oldest", label: "오래된순" },
          { value: "views", label: "조회순" },
        ]}
      />
      <div className="flex gap-3">
        <Button variant="outline" size="M" onClick={() => setModal("delete")}>
          삭제 모달
        </Button>
        <Button variant="outline" size="M" onClick={() => setModal("expired")}>
          401 모달
        </Button>
      </div>
      <ConfirmDialog
        open={modal === "delete"}
        title="게시글을 삭제할까요?"
        description="[게시글 제목]은(는) 삭제하면 되돌릴 수 없어요."
        onConfirm={() => setModal("none")}
        onCancel={() => setModal("none")}
      />
      <SessionExpiredDialog
        open={modal === "expired"}
        onRelogin={() => setModal("none")}
        onLeave={() => setModal("none")}
      />
    </div>
  );
}

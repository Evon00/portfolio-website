"use client";

import { type FormEvent, useCallback, useId, useRef, useState } from "react";
import { useDismiss } from "@/shared/hooks";
import { Icon } from "@/shared/components/icon";
import { SelectMenu } from "@/shared/components/form";
import { cn } from "@/shared/utils";
import { SEARCH_SCOPES, type SearchScope } from "@/shared/_controllers/post";

// Figma Components › Search Bar + Search Condition.
// 검색 조건 드롭다운 + 검색어 입력 + 검색 버튼. 입력 중이거나 값이 있으면 테두리가 primary.
type SearchBarProps = {
  scope: SearchScope;
  keyword: string;
  onScopeChange: (scope: SearchScope) => void;
  onKeywordChange: (keyword: string) => void;
  onSubmit: () => void;
  /** 768 이하에서는 조건을 칩(Search Scope Chips)으로 고르므로 드롭다운을 숨긴다. */
  hideScope?: boolean;
  className?: string;
};

export function SearchBar(props: SearchBarProps) {
  const { scope, keyword, onScopeChange, onKeywordChange, onSubmit, hideScope, className } = props;
  const inputId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      data-focus-box
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex h-12 items-center rounded-3xl border bg-content-inverse pr-1 pl-0.5 transition-colors",
        keyword ? "border-primary" : "border-line-02 focus-within:border-primary",
        className,
      )}
    >
      {!hideScope && (
        <>
          <SearchCondition value={scope} onChange={onScopeChange} />
          <span aria-hidden className="h-5 w-px shrink-0 bg-line-02" />
        </>
      )}
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 pr-2 pl-3.5">
        <label htmlFor={inputId} className="sr-only">
          검색어
        </label>
        <input
          id={inputId}
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="검색어를 입력해 주세요"
          className="min-w-0 flex-1 bg-transparent text-body-m text-content-01 outline-none placeholder:text-content-04 [&::-webkit-search-cancel-button]:hidden"
        />
        {keyword && (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={() => onKeywordChange("")}
            className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-background-04 text-content-01"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <button
        type="submit"
        aria-label="검색"
        className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-primary text-content-inverse transition-colors hover:bg-primary-hover"
      >
        <Icon name="search" size={18} />
      </button>
    </form>
  );
}

function SearchCondition({ value, onChange }: { value: SearchScope; onChange: (value: SearchScope) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const label = SEARCH_SCOPES.find((scope) => scope.value === value)?.label;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`검색 조건: ${label}`}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-[46px] w-[124px] items-center justify-between rounded-3xl pr-3 pl-[18px] text-label-m",
          open ? "text-primary" : "text-content-01",
        )}
      >
        {label}
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <SelectMenu
          id={listId}
          options={[...SEARCH_SCOPES]}
          value={value}
          showCheck
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
          className="absolute top-[53px] left-1 z-20 w-[168px]"
        />
      )}
    </div>
  );
}

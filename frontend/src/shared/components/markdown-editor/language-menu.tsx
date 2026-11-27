"use client";

import { useState } from "react";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/utils";
import { CODE_LANGUAGES, readRecentLanguages } from "./languages";

// Figma Components › Editor / Code Language Menu. 검색 · 최근 사용 · 전체, ↑↓ 이동 · Enter 선택 · Esc 닫기.
type LanguageMenuProps = {
  value?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  className?: string;
};

export function LanguageMenu(props: LanguageMenuProps) {
  const { value, onSelect, onClose, className } = props;
  const [query, setQuery] = useState("");
  const [recent] = useState(readRecentLanguages);
  const [active, setActive] = useState(0);

  const q = query.trim().toLowerCase();
  const matches = CODE_LANGUAGES.filter(
    (language) => !q || language.label.toLowerCase().includes(q) || language.value.includes(q),
  );
  const recentItems = q ? [] : matches.filter((language) => recent.includes(language.value));
  const restItems = q ? matches : matches.filter((language) => !recent.includes(language.value));
  const items = [...recentItems, ...restItems];

  const renderItem = (language: (typeof CODE_LANGUAGES)[number], index: number) => {
    const selected = language.value === value;
    return (
      <li key={language.value} role="option" aria-selected={selected}>
        <button
          type="button"
          onMouseEnter={() => setActive(index)}
          onClick={() => onSelect(language.value)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg px-3 text-left transition-colors",
            index === active && "bg-primary-subtle",
            selected ? "text-label-m text-primary-hover" : "text-body-m text-content-01",
          )}
        >
          {language.label}
          <span className="flex items-center gap-1.5 font-mono text-mono-l text-content-03">
            {language.value}
            {selected && <Icon name="check" size={16} className="text-primary-hover" />}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div
      className={cn(
        "flex w-[248px] flex-col rounded-xl border border-line-01 bg-content-inverse p-1.5 shadow-panel",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const step = event.key === "ArrowDown" ? 1 : -1;
          setActive((index) => (index + step + items.length) % Math.max(items.length, 1));
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (items[active]) onSelect(items[active].value);
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <label data-focus-box className="flex h-10 items-center gap-2 rounded-lg bg-background-04 px-3">
        <Icon name="search" size={16} className="text-content-03" />
        <span className="sr-only">언어 검색</span>
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          placeholder="언어 검색"
          className="min-w-0 flex-1 bg-transparent text-body-m text-content-01 outline-none placeholder:text-content-04"
        />
      </label>
      <ul role="listbox" aria-label="코드 언어" className="mt-1 flex max-h-80 flex-col overflow-y-auto">
        {recentItems.length > 0 && <li className="px-3 pt-2 pb-1 text-caption text-content-03">최근 사용</li>}
        {recentItems.map((language, i) => renderItem(language, i))}
        {recentItems.length > 0 && restItems.length > 0 && (
          <li className="mx-1 my-1 border-t border-line-01 px-2 pt-2 pb-1 text-caption text-content-03">전체</li>
        )}
        {restItems.map((language, i) => renderItem(language, recentItems.length + i))}
        {items.length === 0 && <li className="px-3 py-3 text-body-m text-content-03">찾는 언어가 없어요</li>}
      </ul>
      <p className="mt-1 border-t border-line-01 px-3 pt-2 pb-1 text-caption text-content-03">
        ↑↓ 이동 · Enter 삽입 · Esc 닫기
      </p>
    </div>
  );
}

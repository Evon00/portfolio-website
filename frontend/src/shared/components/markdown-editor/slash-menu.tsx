"use client";

import { type Ref, useEffect, useImperativeHandle, useState } from "react";
import { Icon, type IconName } from "@/shared/components/icon";
import { cn } from "@/shared/utils";
import type { SlashItem } from "./slash-items";

// Figma Components › Editor / Slash Menu. 빈 줄에서 / 입력 → 글자로 거르기 · ↑↓ 이동 · Enter 삽입.
export type SlashMenuHandle = { onKeyDown: (event: KeyboardEvent) => boolean };

type SlashMenuProps = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
  ref?: Ref<SlashMenuHandle>;
};

const TEXT_ICONS = new Set(["H1", "H2", "H3", "H4", "H5", "—"]);

export function SlashMenu(props: SlashMenuProps) {
  const { items, command, ref } = props;
  const [active, setActive] = useState(0);
  // 검색어가 바뀌어 목록이 달라지면 첫 항목부터 고른다.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setActive(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive((index) => (index + step + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        command(items[active]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;
  return (
    <div className="w-[260px] rounded-xl border border-line-01 bg-content-inverse p-1.5 shadow-panel">
      <p className="px-3 pt-1.5 pb-1 text-caption text-content-03">블록 추가</p>
      <ul role="listbox" aria-label="블록 추가">
        {items.map((item, index) => (
          <li key={item.id} role="option" aria-selected={index === active}>
            <button
              type="button"
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command(item)}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors",
                index === active ? "bg-primary-subtle text-label-m text-primary-hover" : "text-body-m text-content-01",
              )}
            >
              <span className="flex w-5 justify-center text-content-02">
                {TEXT_ICONS.has(item.icon) ? (
                  <span className="text-[12px] leading-4 font-bold">{item.icon}</span>
                ) : (
                  <Icon name={item.icon as IconName} size={18} />
                )}
              </span>
              <span className="flex-1">{item.label}</span>
              <span className="font-mono text-mono-m text-content-03">{item.shortcut}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

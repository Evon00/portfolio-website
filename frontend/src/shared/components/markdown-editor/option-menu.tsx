"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/utils";

// Figma Components › Editor / Heading Menu · Line Height Menu · Image Align Menu.
// 제목 · 항목(왼쪽 표시 · 이름 · 오른쪽 단축 표기) · 고른 항목은 primary-subtle 바탕 + 체크. ↑↓ 이동 · Enter 선택 · Esc 닫기.
export type OptionMenuItem<T extends string | number> = {
  value: T;
  label: string;
  leading: ReactNode;
  /** 오른쪽 회색 표기(같은 결과를 내는 마크다운, 줄간격 값) */
  hint?: string;
  /** 이 항목 위에 구분선 */
  divided?: boolean;
};

type OptionMenuProps<T extends string | number> = {
  title: string;
  items: OptionMenuItem<T>[];
  value?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  className?: string;
};

export function OptionMenu<T extends string | number>(props: OptionMenuProps<T>) {
  const { title, items, value, onSelect, onClose, className } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      items.findIndex((item) => item.value === value),
    ),
  );
  useEffect(() => ref.current?.focus(), []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={cn(
        "flex flex-col gap-0.5 rounded-xl border border-line-01 bg-content-inverse p-1.5 shadow-panel outline-none",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const step = event.key === "ArrowDown" ? 1 : -1;
          setActive((index) => (index + step + items.length) % items.length);
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
      <p className="pt-2 pb-1 pl-3 text-caption text-content-03">{title}</p>
      <ul role="listbox" aria-label={title} className="flex flex-col gap-0.5">
        {items.map((item, index) => {
          const selected = item.value === value;
          return (
            <li key={item.value} role="option" aria-selected={selected} className="flex flex-col gap-0.5">
              {item.divided && <span aria-hidden className="h-px bg-line-01" />}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => onSelect(item.value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                  (selected || index === active) && "bg-primary-subtle",
                  selected ? "text-label-m text-primary-hover" : "text-body-m text-content-01",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center text-content-02">{item.leading}</span>
                <span className="flex-1">{item.label}</span>
                {item.hint && <span className="font-mono text-[12px] text-content-03">{item.hint}</span>}
                {selected && <Icon name="check" size={16} className="text-primary-hover" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** 제목 메뉴·슬래시 메뉴의 왼쪽 H1~H5 표시 */
export function HeadingGlyph({ level }: { level: number }) {
  return <span className="text-[11px] leading-none font-bold text-content-02">H{level}</span>;
}

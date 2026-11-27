"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useDismiss } from "@/shared/hooks";
import { cn } from "@/shared/utils";
import { Icon } from "@/shared/components/icon";

// Figma Components › Form / Select. 46px 상자 + 펼친 메뉴(Shadow/Panel).
export type SelectOption<T extends string> = { value: T; label: string };

type SelectProps<T extends string> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  className?: string;
};

export function Select<T extends string>(props: SelectProps<T>) {
  const { value, options, onChange, label, className } = props;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const current = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className={cn("relative w-[180px]", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-[46px] w-full items-center rounded-control border border-line-02 bg-content-inverse pr-3 pl-[15px] text-left text-body-m text-content-01 transition-colors",
          open && "border-2 border-primary pr-[11px] pl-[14px]",
        )}
      >
        <span className="flex-1 truncate">{current?.label}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <SelectMenu
          id={listId}
          options={options}
          value={value}
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
          }}
          className="absolute top-[52px] right-0 left-0 z-20"
        />
      )}
    </div>
  );
}

type SelectMenuProps<T extends string> = {
  id?: string;
  options: SelectOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  /** 선택된 항목 오른쪽에 체크 표시 (Figma Search Condition) */
  showCheck?: boolean;
  className?: string;
};

export function SelectMenu<T extends string>(props: SelectMenuProps<T>) {
  const { id, options, value, onSelect, showCheck, className } = props;
  return (
    <ul
      id={id}
      role="listbox"
      className={cn(
        "flex flex-col gap-0.5 overflow-hidden rounded-xl border border-line-01 bg-content-inverse p-1.5 shadow-panel",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <li key={option.value} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-[9px] text-left transition-colors",
                showCheck && "px-3",
                selected
                  ? "bg-primary-subtle text-label-m text-primary-hover"
                  : "text-body-m text-content-01 hover:bg-primary-subtle",
              )}
            >
              {option.label}
              {showCheck && selected && <Icon name="check" size={16} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

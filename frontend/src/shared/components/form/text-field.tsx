"use client";

import type { ComponentPropsWithRef, MouseEvent } from "react";
import { Icon, type IconName } from "@/shared/components/icon";
import { cn } from "@/shared/utils";

// Figma Components › Form / Text Field. 48px, 폭은 Fill. 앞 문구(prefix)는 슬러그 등에서 사용.
// State=Focus(클릭·Tab 같음): 1px primary 선 + 글로우. 칸의 data-focus-box를 보고 globals.css가 그린다.
// Error는 테두리가 1px → 2px로 두꺼워지므로 안쪽 여백을 1px 줄여 글자가 움직이지 않게 한다.
// Figma Error 테두리 #c0604f는 토큰에 없어 status/danger를 쓴다. 글 입력칸은 이 컴포넌트를 쓴다.
// 박스 어디를 눌러도 입력에 포커스가 가게 한다: 입력은 박스 높이를 채우고(self-stretch), 좌우 여백 · 앞 문구 · 아이콘을 누르면
// 입력으로 포커스를 넘긴다(박스를 label로 바꾸면 앞 문구가 접근성 이름에 섞여 쓰지 않는다).
const SIZE = {
  /** Figma 기본 48px */
  M: "h-12 rounded-control px-[15px]",
  /** 툴바·목록 안의 작은 칸(링크 주소, 갤러리 이미지 설명) 36px */
  S: "h-9 rounded-lg px-3",
} as const;

type TextFieldProps = Omit<ComponentPropsWithRef<"input">, "size" | "prefix"> & {
  prefix?: string;
  /** 앞 아이콘(검색 돋보기 등) */
  icon?: IconName;
  size?: keyof typeof SIZE;
  invalid?: boolean;
  wrapperClassName?: string;
};

function focusInput(event: MouseEvent<HTMLDivElement>) {
  const input = event.currentTarget.querySelector("input");
  if (!input || event.target === input || input.disabled) return;
  event.preventDefault();
  input.focus();
}

export function TextField(props: TextFieldProps) {
  const { prefix, icon, size = "M", invalid, disabled, className, wrapperClassName, ...rest } = props;
  return (
    <div
      data-focus-box
      onMouseDown={focusInput}
      className={cn(
        "flex w-full items-center gap-2 border border-line-02 bg-content-inverse",
        SIZE[size],
        invalid && "border-2 border-danger px-[14px]",
        disabled && "bg-background-03",
        wrapperClassName,
      )}
    >
      {icon && <Icon name={icon} size={16} className="shrink-0 text-content-03" />}
      {prefix && <span className="shrink-0 font-mono text-mono-l text-content-03">{prefix}</span>}
      <input
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "min-w-0 flex-1 self-stretch bg-transparent text-body-m text-content-01 outline-none placeholder:text-content-04 disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

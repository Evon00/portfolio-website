import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/utils";

// Figma 관리자 목록 표: 머리줄 Mono/M content-03 가운데 · 행 사이 점선 · 칸 여백 14/16.
// 열 너비는 머리줄(Th)에 고정 값으로 주고(table-fixed), 너비가 없는 열(제목)이 남는 폭을 가진다.
// 1920에서는 Figma 값 그대로. 1920 미만에서는 제목 열과 함께 일부 열(순서 · 기간 · 기술 스택)이 wide 토큰으로
// 1440까지 같이 줄어든다(theme.css --spacing-wide-*). 나머지 열은 고정.
export function DataTable({ className, ...rest }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="overflow-x-auto rounded-card border border-line-01 bg-background-01">
      <table className={cn("w-full table-fixed border-collapse text-left", className)} {...rest} />
    </div>
  );
}

export function Th({ className, ...rest }: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line-01 px-4 py-[13px] text-center font-mono text-mono-m font-normal text-content-03",
        className,
      )}
      {...rest}
    />
  );
}

export function Tr({ className, ...rest }: ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn("border-b border-dashed border-line-01 last:border-b-0", className)} {...rest} />;
}

export function Td({ className, ...rest }: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("px-4 py-3.5 align-middle", className)} {...rest} />;
}

/** 제목 / 슬러그 칸: 각각 한 줄로 고정하고 넘치면 말줄임(…). 마우스를 올리면 전체가 보인다(title). */
export function TitleSlugCell({ title, slug }: { title: string; slug: string }) {
  return (
    <>
      <p title={title} className="truncate text-label-m text-content-01">
        {title}
      </p>
      <p title={`/${slug}`} className="mt-1 truncate font-mono text-mono-m text-content-03">
        /{slug}
      </p>
    </>
  );
}

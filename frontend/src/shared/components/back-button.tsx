import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

// Figma Components › Back Button. 상세 하단 "← 목록으로".
// Hover: bg → primary-subtle · border → primary-muted · text → primary-strong
export function BackButton(props: { href: string; children?: ReactNode; className?: string }) {
  const { href, children = "← 목록으로", className } = props;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center rounded-3xl border-2 border-line-02 bg-background-01 px-6 text-label-l text-content-01 transition-colors",
        "hover:border-primary-muted hover:bg-primary-subtle hover:text-primary-strong",
        className,
      )}
    >
      {children}
    </Link>
  );
}

// Figma Components › Article Footer. 목록으로 + 오른쪽 링크(맨 위로 · GitHub에서 코드 보기).
export function ArticleFooter(props: { backHref: string; end?: ReactNode; className?: string }) {
  const { backHref, end, className } = props;
  return (
    <div className={cn("flex items-center justify-between border-t border-dashed border-line-02 pt-[29px]", className)}>
      <BackButton href={backHref} />
      {end}
    </div>
  );
}

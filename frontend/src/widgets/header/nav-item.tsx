"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";

// Figma Components › Nav Item. Hover: bg → primary-subtle / Active(현재 페이지): bg primary-light ·
// text primary-hover · Label/L(15px).
export function NavItem({ href, children }: { href: string; children: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center justify-center rounded-full px-[18px] whitespace-nowrap transition-colors",
        active
          ? "bg-primary-light text-label-l text-primary-hover"
          : "text-label-m text-content-01 hover:bg-primary-subtle",
      )}
    >
      {children}
    </Link>
  );
}

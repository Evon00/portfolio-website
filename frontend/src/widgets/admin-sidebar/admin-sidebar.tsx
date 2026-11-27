"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Icon, type IconName } from "@/shared/components/icon";
import { cn } from "@/shared/utils";

// Figma Components › Admin / Sidebar · Sidebar Item. 폭 220, 높이는 화면에 맞춘다.
const MENU: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "대시보드", icon: "dashboard" },
  { href: "/admin/posts", label: "게시글", icon: "file" },
  { href: "/admin/projects", label: "프로젝트", icon: "folder" },
  { href: "/admin/skills", label: "기술 스택", icon: "layers" },
  { href: "/admin/profile", label: "프로필", icon: "user" },
];

const ITEM = "flex h-11 w-full items-center gap-2.5 rounded-xl px-3.5 transition-colors";

export function AdminSidebar({ name }: { name: string }) {
  const logout = useLogout();
  return (
    // 바탕·테두리는 페이지 길이만큼 늘이고, 메뉴는 화면에 고정한다.
    <aside className="w-[220px] shrink-0 border-r border-line-01 bg-background-01">
      <div className="sticky top-0 flex h-dvh flex-col justify-between px-4 pt-8 pb-7">
        <nav aria-label="관리자 메뉴" className="flex flex-col gap-1">
          <Link href="/admin" className="flex items-center gap-2 px-2.5 pb-[22px]">
            <span className="font-display text-title-3 text-content-01">{name}.log</span>
            <span className="rounded-full bg-content-01 px-2 py-0.5 font-mono text-mono-m text-background-03">
              admin
            </span>
          </Link>
          {/* 현재 주소는 요청 때만 알 수 있어 메뉴 강조만 따로 기다린다(Cache Components). */}
          <Suspense fallback={<MenuLinks pathname={null} />}>
            <CurrentMenuLinks />
          </Suspense>
        </nav>
        <div className="flex flex-col gap-1 border-t border-dashed border-line-01 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={cn(ITEM, "text-label-m text-content-02 hover:bg-primary-subtle")}
          >
            <Icon name="external" size={18} />
            사이트 보기
          </a>
          <button
            type="button"
            onClick={() => logout()}
            className={cn(ITEM, "text-label-m text-content-02 hover:bg-primary-subtle")}
          >
            <Icon name="logout" size={18} />
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}

function CurrentMenuLinks() {
  return <MenuLinks pathname={usePathname()} />;
}

function MenuLinks({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) =>
    pathname !== null && (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return MENU.map((item) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          ITEM,
          active
            ? "bg-primary-light text-label-l text-primary-hover"
            : "text-label-m text-content-02 hover:bg-primary-subtle",
        )}
      >
        <Icon name={item.icon} size={18} />
        {item.label}
      </Link>
    );
  });
}

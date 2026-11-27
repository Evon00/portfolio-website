"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/shared/components/button";
import { ContactButton } from "@/shared/components/contact-button";
import { Icon } from "@/shared/components/icon";
import { IconButton } from "@/shared/components/icon-button";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { cn } from "@/shared/utils";
import { SiteLogo } from "@/shared/components/site-logo";
import { useMobileMenuStore } from "./mobile-menu.store";

// Figma Components › Mobile Menu Overlay · Drawer.
// 열기: 딤이 바로 깔리고 드로어가 오른쪽에서 320ms ease-drawer로 들어온다.
// 닫기: 240ms ease-in으로 나간다. 딤은 content/01 42%가 함께 페이드된다.
const MENU = [
  { href: "/", label: "홈" },
  { href: "/projects", label: "프로젝트" },
  { href: "/blog", label: "블로그" },
];

export function MobileMenuButton() {
  const setOpen = useMobileMenuStore((state) => state.setOpen);
  return <IconButton icon="menu" label="메뉴 열기" size={44} onClick={() => setOpen(true)} className="md:hidden" />;
}

// GitHub · 이메일은 비어 있으면 그 버튼을 숨긴다.
type MobileMenuProps = { name: string; email: string | null; githubUrl: string | null };

export function MobileMenu(props: MobileMenuProps) {
  const { name, email, githubUrl } = props;
  const open = useMobileMenuStore((state) => state.open);
  const setOpen = useMobileMenuStore((state) => state.setOpen);
  const pathname = usePathname();

  // 페이지를 옮기면 닫는다.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // 열려 있는 동안 뒤 페이지 스크롤을 막고 Esc로 닫는다.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div className="fixed inset-0 z-50 md:hidden" inert={!open} aria-hidden={!open}>
      <button
        type="button"
        aria-label="메뉴 닫기"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-content-01 transition-opacity",
          open
            ? "opacity-42 duration-(--duration-drawer-open)"
            : "pointer-events-none opacity-0 duration-(--duration-drawer-close)",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        className={cn(
          "absolute inset-y-0 right-0 flex w-[300px] flex-col gap-6 overflow-hidden border-l-2 border-line-01 bg-background-03 bg-[url(/images/paper-texture.webp)] bg-size-[100px_100px] px-5 pt-4 pb-8 shadow-drawer transition-transform",
          open
            ? "translate-x-0 duration-(--duration-drawer-open) ease-drawer"
            : "translate-x-full duration-(--duration-drawer-close) ease-in",
        )}
      >
        <div className="flex items-center justify-between">
          <SiteLogo name={name} size="mobile" />
          <IconButton icon="close" label="메뉴 닫기" size={44} onClick={() => setOpen(false)} />
        </div>
        <nav aria-label="주요 메뉴" className="flex flex-col gap-1">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-14 items-center justify-between rounded-xl px-2 font-display text-title-3 text-content-01 transition-colors hover:bg-primary-subtle"
            >
              {item.label}
              <Icon name="chevron-right" size={18} className="text-primary-strong" />
            </Link>
          ))}
        </nav>
        <hr className="border-0 border-t-[1.5px] border-dashed border-primary-muted" />
        {/* 메뉴를 닫은 뒤 푸터 연락처로 스크롤한다 */}
        <ContactButton icon="mail" beforeScroll={() => setOpen(false)} className="w-full" />
        {(githubUrl || email) && (
          <div className="flex gap-2">
            {githubUrl && (
              <Button href={githubUrl} variant="outline" size="M" icon="code" className="flex-1">
                GitHub
              </Button>
            )}
            {email && (
              <Button href={`mailto:${email}`} variant="outline" size="M" icon="mail" className="flex-1">
                이메일
              </Button>
            )}
          </div>
        )}
        <PaperAsset name="blob-lavender-surprised" className="top-[468px] right-2.5 h-[100px] w-[150px]" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { cn, scrollToPageTop } from "@/shared/utils";
import { IconButton } from "./icon-button";

// 공개 화면 오른쪽 아래에 떠 있는 "맨 위로" 버튼(SiteShell에 한 번 둔다. 어드민에는 없다).
// Figma에 전용 디자인이 없어 Icon Button 44px · Lavender · 위쪽 화살표를 그대로 쓴다.
// · 한 화면 넘게 내려가면 보이고, 그보다 위로 오면 숨는다(스크롤 방향과는 관계없다).
// · 푸터 · Article Footer의 "맨 위로 ↑"(data-scroll-top-link)가 버튼 자리와 겹치면 숨는다(그 링크를 가리지 않게).
// · 누르면 맨 위로 부드럽게(줄인 움직임이면 바로) 이동하고, 본문 제목(main h1)으로 포커스를 옮긴다(scrollToPageTop).
// · 숨길 때는 visibility도 꺼서 Tab · 화면 낭독기에서 빠진다. 전환은 --duration-fade.
export function BackToTop() {
  const [scrolled, setScrolled] = useState(false);
  const [covering, setCovering] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  // 버튼으로 맨 위로 가는 동안에는 다시 나타나지 않게 한다.
  const jumping = useRef(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (jumping.current && y <= 0) jumping.current = false;
        if (!jumping.current) setScrolled(y > window.innerHeight);
        // 버튼 자리(여유 8px)와 겹치는 "맨 위로 ↑" 글자 링크가 있으면 숨는다.
        const box = boxRef.current?.getBoundingClientRect();
        const links = document.querySelectorAll("[data-scroll-top-link]");
        setCovering(
          Boolean(box) &&
            Array.from(links).some((link) => {
              const r = link.getBoundingClientRect();
              return (
                r.left < box!.right + 8 && r.right > box!.left - 8 && r.top < box!.bottom + 8 && r.bottom > box!.top - 8
              );
            }),
        );
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const visible = scrolled && !covering;

  function goTop() {
    setScrolled(false);
    jumping.current = scrollToPageTop();
  }

  return (
    <div
      ref={boxRef}
      className={cn(
        // 모바일 안전 영역(홈 표시줄 · 노치)만큼 더 띄운다.
        "fixed right-[max(var(--spacing-fluid-16-28),calc(env(safe-area-inset-right)+16px))] bottom-[max(var(--spacing-fluid-16-28),calc(env(safe-area-inset-bottom)+16px))] z-40",
        "transition-[opacity,visibility] duration-(--duration-fade)",
        visible ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <IconButton icon="arrow-up" label="맨 위로" size={44} onClick={goTop} />
    </div>
  );
}

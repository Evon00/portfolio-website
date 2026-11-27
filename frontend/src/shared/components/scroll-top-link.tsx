"use client";

import type { ReactNode } from "react";
import { scrollToPageTop } from "@/shared/utils";
import { TextLink } from "./text-link";

// 푸터 · Article Footer의 "맨 위로 ↑" 글자 링크. 누르면 주소를 바꾸지 않고 맨 위로 간다(scrollToPageTop, shared/utils/scroll.ts).
// href="#top"은 JS가 돌기 전에도 동작하게 남겨 두고, 누를 때는 기본 이동을 막는다.
// data-scroll-top-link: 이 링크가 떠 있는 "맨 위로"(back-to-top.tsx) 자리와 겹치면 그 버튼이 숨는다(이 링크를 가리지 않게).
export function ScrollTopLink({ children = "맨 위로 ↑" }: { children?: ReactNode }) {
  return (
    <TextLink
      href="#top"
      data-scroll-top-link
      onClick={(event) => {
        event.preventDefault();
        scrollToPageTop();
      }}
    >
      {children}
    </TextLink>
  );
}

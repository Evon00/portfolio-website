"use client";

import { scrollToSection } from "@/shared/utils";
import { Button, type ButtonProps } from "./button";

// 헤더 · 모바일 메뉴의 "연락하기". 누르면 주소를 바꾸지 않고 푸터 연락처(#contact)로 스크롤한다(scrollToSection).
// 푸터는 모든 공개 페이지에 있어 지금 페이지의 연락처로 간다. href="#contact"는 JS가 돌기 전에도 동작하게 남겨 둔다.
// beforeScroll: 모바일 메뉴처럼 먼저 닫아야 할 때. 닫힌 다음 프레임에 스크롤한다(메뉴가 막아 둔 페이지 스크롤이 풀린 뒤).
type ContactButtonProps = Omit<ButtonProps, "href" | "onClick"> & { beforeScroll?: () => void };

export function ContactButton(props: ContactButtonProps) {
  const { beforeScroll, children = "연락하기", ...rest } = props;
  return (
    <Button
      href="#contact"
      onClick={(event) => {
        event.preventDefault();
        if (!beforeScroll) return void scrollToSection("contact");
        beforeScroll();
        requestAnimationFrame(() => scrollToSection("contact"));
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}

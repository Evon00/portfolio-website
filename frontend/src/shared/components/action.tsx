import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

// 버튼처럼 보이는 요소를 href 유무에 따라 <button> · 내부 <Link> · 외부 <a>로 그린다.
export type ActionProps = {
  children?: ReactNode;
  className?: string;
  href?: string;
  /** href가 있을 때 새 탭으로 연다. 외부 주소는 기본 true */
  external?: boolean;
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children" | "disabled">;

export function Action(props: ActionProps) {
  const { href, external, disabled, className, children, type, ...rest } = props;
  if (href && !disabled) {
    const isExternal = external ?? /^(https?:|mailto:)/.test(href);
    const anchorProps = rest as ComponentPropsWithoutRef<"a">;
    if (isExternal) {
      return (
        <a
          href={href}
          className={className}
          {...anchorProps}
          {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={className} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} disabled={disabled} className={className} {...rest}>
      {children}
    </button>
  );
}

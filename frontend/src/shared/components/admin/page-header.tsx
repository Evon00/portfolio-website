import type { ReactNode } from "react";
import { TextLink } from "@/shared/components/text-link";

// Figma 관리자 화면 › page header. 제목(Title/2) + 개수(Body/L) + 오른쪽 버튼. 작성·수정 화면은 위에 목록으로 가는 링크.
type AdminPageHeaderProps = {
  title: string;
  count?: number;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function AdminPageHeader(props: AdminPageHeaderProps) {
  const { title, count, back, actions } = props;
  return (
    <header className="flex flex-col gap-4">
      {back && (
        <TextLink href={back.href} className="-my-3 self-start">
          ← {back.label}
        </TextLink>
      )}
      <div className="flex min-h-11 items-center justify-between gap-4">
        <h1 className="flex items-baseline gap-3 font-display text-title-2 text-content-01">
          {title}
          {count !== undefined && <span className="font-sans text-body-l text-content-02">총 {count}개</span>}
        </h1>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
    </header>
  );
}

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/shared/utils";

// Figma 관리자 카드(패널): background-01 · line-01 · 라운드 18 · 여백 24
export function AdminPanel({ className, ...rest }: ComponentPropsWithoutRef<"section">) {
  return <section className={cn("rounded-card border border-line-01 bg-background-01 p-6", className)} {...rest} />;
}

/** 패널 제목(Title/3) + 설명(Caption) */
export function PanelHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-display text-title-3 text-content-01">{title}</h2>
      {description && <p className="text-caption text-content-03">{description}</p>}
    </div>
  );
}

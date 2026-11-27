import type { ElementType, ReactNode } from "react";
import { cn } from "@/shared/utils";
import { PaperAsset } from "@/shared/components/paper/paper-asset";

// Figma Components › Page Title · Section Title. 제목 뒤에 마스킹테이프를 비스듬히 붙인다.
// 768 미만은 M, 이상은 L. 테이프 위치·각도는 Figma 값(inset %, rotate)을 그대로 쓴다.
type TitleProps = {
  children: ReactNode;
  tape?: "lilac" | "sage";
  as?: ElementType;
  className?: string;
};

const TAPE = {
  lilac: { name: "tape-lavender", tilt: "rotate-[1.5deg] md:rotate-[1.38deg]", opacity: "" },
  sage: { name: "tape-sage", tilt: "-rotate-[1.5deg] md:-rotate-[1.38deg]", opacity: "opacity-90" },
} as const;

// Figma Page Title M은 텍스트 스타일 없이 36px / 1.2로 지정돼 있다(토큰 없음). 값을 그대로 옮긴다.
export function PageTitle(props: TitleProps) {
  const { children, tape = "lilac", as: Tag = "h1", className } = props;
  const t = TAPE[tape];
  return (
    <div className={cn("relative inline-flex px-5 py-1", className)}>
      <PaperAsset
        name={t.name}
        className={cn(
          "top-[26.5%] -right-[7.95%] bottom-[0.43%] -left-[2.82%] md:-right-[6.06%] md:-left-[2.2%]",
          t.tilt,
          t.opacity,
        )}
      />
      <Tag className="relative font-display text-[36px] leading-[1.2] text-content-01 md:text-display-s">
        {children}
      </Tag>
    </div>
  );
}

export function SectionTitle(props: TitleProps) {
  const { children, tape = "lilac", as: Tag = "h2", className } = props;
  const t = TAPE[tape];
  return (
    <div className={cn("relative inline-flex px-[18px] py-1", className)}>
      <PaperAsset
        name={t.name}
        className={cn(
          "top-[24.7%] -right-[6.49%] -bottom-[0.92%] -left-[2.28%] md:-right-[5.16%] md:-bottom-[0.8%] md:-left-[1.84%]",
          tape === "lilac" ? "rotate-[1.6deg] md:rotate-[1.5deg]" : "-rotate-[1.6deg] md:-rotate-[1.5deg]",
          t.opacity,
        )}
      />
      <Tag className="relative font-display text-title-2 text-content-01 md:text-title-1">{children}</Tag>
    </div>
  );
}

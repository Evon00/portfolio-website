import type { ElementType, ReactNode } from "react";
import { cn } from "@/shared/utils";

// 페이지 콘텐츠 폭. Figma 프레임의 좌우 여백(모바일 20 · 768 이상 40)과 최대폭을 맞춘다.
// wide 1120(목록·메인) · medium 960(프로젝트 상세) · narrow 780(블로그 상세·에러)
// flex 부모 안에서도 줄어들지 않도록 w-full + border-box로 두고, 최대폭에 좌우 여백(--gutter)을 더한다.
const WIDTH = {
  wide: "max-w-[calc(1120px+2*var(--gutter))]",
  medium: "max-w-[calc(960px+2*var(--gutter))]",
  narrow: "max-w-[calc(780px+2*var(--gutter))]",
} as const;

export const GUTTER = "mx-auto w-full px-(--gutter) [--gutter:var(--spacing-fluid-20-40)]";

type ContainerProps = {
  size?: keyof typeof WIDTH;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

export function Container(props: ContainerProps) {
  const { size = "wide", as: Tag = "div", className, children } = props;
  return <Tag className={cn(GUTTER, WIDTH[size], className)}>{children}</Tag>;
}

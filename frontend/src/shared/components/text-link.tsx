import { cn } from "@/shared/utils";
import { Action, type ActionProps } from "./action";

// Figma Components › Text Link. 전체 보기 · 자세히 보기 · 맨 위로. 44px 터치 영역.
// Hover: 색은 primary-strong 유지, opacity 1 → 0.55 (밑줄 없음).
export function TextLink({ className, ...rest }: ActionProps) {
  return (
    <Action
      className={cn(
        "inline-flex h-11 items-center text-label-m whitespace-nowrap text-primary-strong transition-opacity hover:opacity-55",
        className,
      )}
      {...rest}
    />
  );
}

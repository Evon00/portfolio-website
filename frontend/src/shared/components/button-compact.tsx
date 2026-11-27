import { cn } from "@/shared/utils";
import { Action, type ActionProps } from "./action";

// Figma Components › Button / Compact. 표의 수정·삭제, 모달 취소·삭제 등 36px 작은 버튼.
const VARIANT = {
  neutral: "border border-line-02 bg-background-01 text-content-02 hover:bg-primary-subtle",
  danger: "bg-danger text-content-inverse hover:bg-danger-strong",
  "danger-outline": "border border-danger-muted bg-background-01 text-danger hover:bg-danger-light",
} as const;

export type ButtonCompactProps = ActionProps & { variant?: keyof typeof VARIANT };

export function ButtonCompact(props: ButtonCompactProps) {
  const { variant = "neutral", className, ...rest } = props;
  return (
    <Action
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-control px-[13px] text-label-m whitespace-nowrap transition-colors",
        "disabled:opacity-40",
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
}

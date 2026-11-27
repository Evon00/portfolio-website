import type { ComponentPropsWithRef } from "react";
import { cn } from "@/shared/utils";

// Figma Components › Form / Textarea. 여러 줄 입력. State=Focus(클릭·Tab 같음)는 1px primary 선 + 글로우로,
// data-focus-box를 보고 globals.css가 그린다. 여러 줄 입력칸은 이 컴포넌트를 쓴다.
type TextareaProps = ComponentPropsWithRef<"textarea"> & { invalid?: boolean };

export function Textarea(props: TextareaProps) {
  const { invalid, className, ...rest } = props;
  return (
    <textarea
      data-focus-box
      aria-invalid={invalid || undefined}
      className={cn(
        "min-h-[110px] w-full resize-y rounded-control border border-line-02 bg-content-inverse px-[15px] py-3 text-body-m text-content-01 outline-none transition-colors placeholder:text-content-04",
        invalid && "border-2 border-danger px-[14px] py-[11px]",
        className,
      )}
      {...rest}
    />
  );
}

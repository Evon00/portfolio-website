import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "@/shared/utils";
import { Icon } from "@/shared/components/icon";

// Figma Components › Form / Checkbox. 18px 상자, 선택 시 primary + 체크 14px.
// Figma 미선택 테두리 #8e86a0은 토큰에 없어 가장 가까운 content-04(#8f879e)를 쓴다.
type CheckboxProps = Omit<ComponentPropsWithRef<"input">, "type"> & { children?: ReactNode };

export function Checkbox(props: CheckboxProps) {
  const { children, className, ...rest } = props;
  return (
    <label className={cn("inline-flex items-center gap-2.5 text-body-m text-content-01", className)}>
      <span className="relative flex size-[18px] shrink-0 items-center justify-center">
        <input type="checkbox" className="peer absolute inset-0 m-0 cursor-pointer appearance-none" {...rest} />
        <span className="pointer-events-none absolute inset-0 rounded-sm border-[1.5px] border-content-04 bg-content-inverse transition-colors peer-checked:border-0 peer-checked:bg-primary peer-focus-visible:focus-glow peer-disabled:opacity-40" />
        <Icon
          name="check"
          size={14}
          className="pointer-events-none relative text-content-inverse opacity-0 peer-checked:opacity-100"
        />
      </span>
      {children}
    </label>
  );
}

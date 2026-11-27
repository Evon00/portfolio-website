import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

// Figma Components › Form / Label. Required=필수 표시(*).
type FormLabelProps = {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormLabel(props: FormLabelProps) {
  const { htmlFor, required, children, className } = props;
  return (
    <label htmlFor={htmlFor} className={cn("inline-flex gap-[3px] text-label-m text-content-01", className)}>
      {children}
      {required && (
        <span aria-hidden className="text-danger">
          *
        </span>
      )}
    </label>
  );
}

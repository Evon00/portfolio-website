import type { ReactNode } from "react";
import { cn } from "@/shared/utils";
import { Icon } from "@/shared/components/icon";

// Figma Components › Form / Message. 입력 아래 안내·검증 메시지.
type FormMessageProps = {
  status: "success" | "error" | "help";
  children: ReactNode;
  id?: string;
  className?: string;
};

export function FormMessage(props: FormMessageProps) {
  const { status, children, id, className } = props;
  if (status === "help") {
    return (
      <p id={id} className={cn("text-caption text-content-03", className)}>
        {children}
      </p>
    );
  }
  const isError = status === "error";
  return (
    <p
      id={id}
      role={isError ? "alert" : undefined}
      className={cn("flex items-center gap-1.5 text-label-m", isError ? "text-danger" : "text-success", className)}
    >
      <Icon name={isError ? "alert" : "check"} size={16} />
      {children}
    </p>
  );
}

// Figma Components › Alert / Danger. 로그인 실패 등 오류 알림.
export function AlertDanger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-danger-muted bg-danger-light px-[15px] py-[13px] text-label-m text-danger-strong",
        className,
      )}
    >
      <Icon name="alert" size={18} />
      <p className="flex-1">{children}</p>
    </div>
  );
}

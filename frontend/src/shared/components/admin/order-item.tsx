import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/shared/utils";
import { Icon } from "@/shared/components/icon";

// Figma Components › Order Item. 끌어서 순서를 바꾸는 목록 항목.
// Featured = 주요 프로젝트(번호) · Skill = 프로필 핵심 스택. 손잡이는 useReorder의 handleProps를 받는다.
type OrderItemProps = Omit<ComponentPropsWithoutRef<"li">, "children"> & {
  handle: ComponentPropsWithoutRef<"button">;
  dragging?: boolean;
  children: ReactNode;
};

export function OrderItem(props: OrderItemProps) {
  const { handle, dragging, className, children, ...rest } = props;
  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-line-01 bg-background-02 px-2.5 py-2 transition-opacity",
        dragging && "opacity-50",
        className,
      )}
      {...rest}
    >
      <button
        type="button"
        className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-md text-content-03 hover:bg-background-04 active:cursor-grabbing"
        {...handle}
      >
        <Icon name="drag-handle" size={16} />
      </button>
      {children}
    </li>
  );
}

/** 항목 오른쪽 x (지우기) */
export function OrderItemRemove({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${label} 빼기`}
      onClick={onClick}
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-content-02 hover:bg-background-04"
    >
      <Icon name="close" size={14} />
    </button>
  );
}

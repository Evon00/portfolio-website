import { cn } from "@/shared/utils";
import { Icon } from "./icon";

// Figma Components › Carousel Arrow. 48px, Shadow/Paper lift.
// Hover: bg → primary-subtle · border → primary-strong / Pressed: bg primary-light · 그림자 제거
// Disabled(첫/마지막 페이지): opacity 0.4
type CarouselArrowProps = {
  direction: "prev" | "next";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function CarouselArrow(props: CarouselArrowProps) {
  const { direction, disabled, onClick, className } = props;
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전" : "다음"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-3xl border-2 border-line-02 bg-background-01 text-content-01 shadow-paper-lift transition-colors",
        "enabled:hover:border-primary-strong enabled:hover:bg-primary-subtle enabled:active:bg-primary-light enabled:active:shadow-none",
        "disabled:opacity-40",
        className,
      )}
    >
      <Icon name={direction === "prev" ? "chevron-left" : "chevron-right"} />
    </button>
  );
}

// Figma Components › Carousel Dot. 44px 터치 영역, 활성은 32×12 막대.
type CarouselDotsProps = {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function CarouselDots(props: CarouselDotsProps) {
  const { count, active, onSelect, className } = props;
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1}번째 페이지`}
          aria-current={index === active ? "true" : undefined}
          onClick={() => onSelect(index)}
          className="flex size-11 items-center justify-center"
        >
          <span
            className={cn(
              "h-3 rounded-md border-2 border-primary-strong transition-[width,background-color] duration-(--duration-carousel) ease-in-out",
              index === active ? "w-8 bg-primary-strong" : "w-3",
            )}
          />
        </button>
      ))}
    </div>
  );
}

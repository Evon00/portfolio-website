import { cn } from "@/shared/utils";
import { SORT_OPTIONS, type SortOption } from "@/shared/_controllers/post";

// Figma Components › Sort Toggle. 선택된 쪽은 흰 바탕 + Shadow/Paper lift.
type SortToggleProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
};

export function SortToggle(props: SortToggleProps) {
  const { value, onChange, className } = props;
  return (
    <div role="radiogroup" aria-label="정렬" className={cn("inline-flex rounded-3xl bg-background-04 p-1", className)}>
      {SORT_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-10 items-center rounded-pill px-3.5 text-label-m whitespace-nowrap transition-colors",
              selected ? "bg-background-01 text-content-01 shadow-paper-lift" : "text-content-02",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

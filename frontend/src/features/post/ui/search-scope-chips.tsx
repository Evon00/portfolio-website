import { cn } from "@/shared/utils";
import { SEARCH_SCOPES, type SearchScope } from "@/shared/_controllers/post";

// Figma Components › Search Scope Chips. 768 이하에서 검색 조건을 칩으로 고른다.
type SearchScopeChipsProps = {
  value: SearchScope;
  onChange: (value: SearchScope) => void;
  className?: string;
};

export function SearchScopeChips(props: SearchScopeChipsProps) {
  const { value, onChange, className } = props;
  return (
    <div role="radiogroup" aria-label="검색 조건" className={cn("flex flex-wrap gap-2", className)}>
      {SEARCH_SCOPES.map((scope) => {
        const selected = scope.value === value;
        return (
          <button
            key={scope.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(scope.value)}
            className={cn(
              "flex h-9 items-center rounded-card border px-3.5 whitespace-nowrap transition-colors",
              selected
                ? "border-primary-muted bg-primary-subtle text-label-m text-primary-hover"
                : "border-line-02 bg-background-01 text-body-m text-content-01",
            )}
          >
            {scope.label}
          </button>
        );
      })}
    </div>
  );
}

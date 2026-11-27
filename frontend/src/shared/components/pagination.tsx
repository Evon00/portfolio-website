import { cn } from "@/shared/utils";
import { Icon } from "./icon";

// Figma Components › Pagination Item. 44px 칸.
// Hover: bg → primary-subtle · border → primary-muted / Active: bg primary-strong · text content-inverse
const ITEM =
  "flex size-11 items-center justify-center rounded-xl border font-mono text-mono-l transition-colors disabled:opacity-40";
const IDLE =
  "border-line-02 bg-background-01 text-content-01 enabled:hover:border-primary-muted enabled:hover:bg-primary-subtle";

// 처음·끝과 현재 페이지 앞뒤 1개만 보이고 나머지는 "…"로 줄인다. 예: 1 … 4 5 6 … 12
// 빠지는 페이지가 하나뿐이면 "…" 대신 그 번호를 보인다(1 … 3 보다 1 2 3이 짧지 않으므로).
export function getPageItems(page: number, totalPages: number): (number | "gap")[] {
  const keep = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...keep].sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) items.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) items.push("gap");
    items.push(p);
  });
  return items;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

export function Pagination(props: PaginationProps) {
  const { page, totalPages, onChange, className } = props;
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  return (
    <nav aria-label="페이지" className={cn("flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        className={cn(ITEM, IDLE)}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="이전 페이지"
      >
        <Icon name="chevron-left" size={18} />
      </button>
      {items.map((p, i) =>
        p === "gap" ? (
          // Figma에 생략 표시 디자인이 없어 같은 44px 칸에 글자만 둔다.
          <span
            key={`gap-${i}`}
            aria-hidden
            className="flex size-11 items-center justify-center font-mono text-mono-l text-content-03"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            className={cn(ITEM, p === page ? "border-primary-strong bg-primary-strong text-content-inverse" : IDLE)}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(ITEM, IDLE)}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="다음 페이지"
      >
        <Icon name="chevron-right" size={18} />
      </button>
    </nav>
  );
}

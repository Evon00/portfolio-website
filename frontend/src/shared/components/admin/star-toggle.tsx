import { cn } from "@/shared/utils";
import { Icon } from "@/shared/components/icon";

// Figma Components › Star Toggle. 메인 주요 프로젝트 선택(★).
export function StarToggle(props: { on: boolean; onToggle: () => void; label: string }) {
  const { on, onToggle, label } = props;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${label} 주요 프로젝트로 보이기`}
      title={on ? "메인 주요 프로젝트에서 빼기" : "메인 주요 프로젝트로 보이기"}
      onClick={onToggle}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-control border transition-colors",
        on
          ? "border-accent-mustard-muted bg-accent-mustard-bg text-warning"
          : "border-line-02 bg-background-01 text-content-03 hover:border-accent-mustard-muted",
      )}
    >
      <Icon name="star" size={18} />
    </button>
  );
}

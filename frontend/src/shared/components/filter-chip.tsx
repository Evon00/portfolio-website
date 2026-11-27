import { cn } from "@/shared/utils";
import { SkillLogo, type SkillView } from "./skill";

// Figma Components › Filter Chip. Icon=Yes는 스킬 필터, No는 전체·카테고리.
// Hover: bg → primary-subtle · border → primary-muted / Selected: bg primary-strong · text content-inverse
type FilterChipProps = {
  label: string;
  selected?: boolean;
  /** 스킬 필터일 때 아이콘 자리를 그린다. */
  skill?: SkillView;
  onClick?: () => void;
  className?: string;
};

export function FilterChip(props: FilterChipProps) {
  const { label, selected, skill, onClick, className } = props;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-pill border font-mono text-mono-l whitespace-nowrap transition-colors",
        skill?.iconUrl ? "pr-[19px] pl-[9px]" : "px-[19px]",
        selected
          ? "border-primary-strong bg-primary-strong text-content-inverse"
          : "border-line-02 bg-background-01 text-content-01 hover:border-primary-muted hover:bg-primary-subtle",
        className,
      )}
    >
      {skill?.iconUrl && (
        <span className="flex size-6 items-center justify-center overflow-hidden rounded-md border border-dashed border-primary-muted bg-primary-light text-content-03">
          <SkillLogo iconUrl={skill.iconUrl} />
        </span>
      )}
      {label}
    </button>
  );
}

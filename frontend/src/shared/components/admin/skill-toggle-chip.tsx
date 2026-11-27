import { cn } from "@/shared/utils";
import { Icon } from "@/shared/components/icon";

// Figma Components › Skill Toggle Chip. 게시글·프로젝트 폼의 기술 스택 선택. 선택되면 브랜드 테두리 + 체크.
type SkillToggleChipProps = { label: string; selected: boolean; onToggle: () => void };

export function SkillToggleChip(props: SkillToggleChipProps) {
  const { label, selected, onToggle } = props;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex h-[35px] items-center gap-1.5 rounded-full border pr-3.5 font-mono text-[13px] leading-[17px] transition-colors",
        selected
          ? "border-primary bg-primary-subtle pl-2.5 text-primary-hover"
          : "border-line-02 bg-background-01 pl-3.5 text-content-02 hover:border-primary-muted",
      )}
    >
      {selected && <Icon name="check" size={14} />}
      {label}
    </button>
  );
}

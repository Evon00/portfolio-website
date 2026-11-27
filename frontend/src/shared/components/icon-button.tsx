import { cn } from "@/shared/utils";
import { Action, type ActionProps } from "./action";
import { Icon, type IconName } from "./icon";

// Figma Components › Icon Button. 원형 아이콘 링크(GitHub·데모·메뉴). 40px, 아이콘 18px.
// Hover: bg → primary-light(Lavender) · border → primary-muted
const TONE = {
  lavender: "bg-primary-subtle hover:bg-primary-light",
  white: "bg-content-inverse",
  /** 프로젝트 그리드 카드의 링크 버튼. Figma 값 #f3eee3은 토큰에 없어 가장 가까운 background-03을 쓴다. */
  paper: "bg-background-03",
} as const;

export type IconButtonProps = ActionProps & {
  icon: IconName;
  label: string;
  tone?: keyof typeof TONE;
  /** 버튼 크기(px). 기본 40, 헤더 메뉴 버튼은 44 */
  size?: 40 | 44;
};

export function IconButton(props: IconButtonProps) {
  const { icon, label, tone = "lavender", size = 40, className, ...rest } = props;
  return (
    <Action
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill border-[1.5px] border-transparent text-primary-strong transition-colors",
        "hover:border-primary-muted disabled:opacity-50 aria-disabled:opacity-50",
        size === 44 ? "size-11" : "size-10",
        TONE[tone],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={18} />
    </Action>
  );
}

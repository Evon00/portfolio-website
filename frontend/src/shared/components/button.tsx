import { cn } from "@/shared/utils";
import { Action, type ActionProps } from "./action";
import { Icon, type IconName } from "./icon";

// Figma Components › Button. Primary=주요 행동, Outline=보조 행동. L=52px, M=44px.
// Hover: Primary bg primary → primary-hover / Outline bg background-01 → primary-light
// Pressed: Primary는 안쪽 그림자를 빼고 primary-hover / Outline은 primary-muted
// Focus(Tab): 공통 1px primary 선 + 글로우(globals.css). Primary는 바탕이 같은 색이라 선을 2px 띄워 그린다.
const VARIANT = {
  primary:
    "bg-primary text-content-inverse shadow-button-inset hover:bg-primary-hover active:bg-primary-hover active:shadow-none focus-visible:outline-offset-2",
  outline:
    "border-2 border-primary-strong bg-background-01 text-primary-strong hover:bg-primary-light active:bg-primary-muted",
} as const;

const SIZE = {
  L: { box: "h-[52px] px-[26px]", icon: 20 },
  M: { box: "h-11 px-5", icon: 18 },
} as const;

export type ButtonProps = ActionProps & {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  icon?: IconName;
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "L", icon, className, children, ...rest } = props;
  return (
    <Action
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-full text-label-l whitespace-nowrap transition-colors",
        "disabled:opacity-40 aria-disabled:opacity-40",
        VARIANT[variant],
        SIZE[size].box,
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={SIZE[size].icon} />}
      {children}
    </Action>
  );
}

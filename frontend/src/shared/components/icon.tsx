import { cn } from "@/shared/utils";

// public/icons/sprite.svg의 symbol id. Figma Icons 페이지의 아이콘(20×20, stroke 1.667)을 그대로 옮겼고
// 색만 currentColor로 바꿔 인스턴스별 색 덮어쓰기를 표현한다.
export type IconName =
  | "alert"
  | "align-center"
  | "align-left"
  | "align-right"
  | "arrow-up"
  | "chart"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "close"
  | "code"
  | "code-block"
  | "dashboard"
  | "drag-handle"
  | "external"
  | "eye"
  | "file"
  | "folder"
  | "grip"
  | "image"
  | "keyboard"
  | "layers"
  | "line-height"
  | "link"
  | "list"
  | "list-ordered"
  | "lock"
  | "logout"
  | "mail"
  | "maximize"
  | "menu"
  | "pencil"
  | "plus"
  | "quote"
  | "refresh"
  | "search"
  | "star"
  | "strike"
  | "table"
  | "upload"
  | "user"
  | "wifi-off";

type IconProps = {
  name: IconName;
  /** px. Figma 기본 20 */
  size?: number;
  className?: string;
  /** 의미가 있는 아이콘이면 라벨을 준다. 없으면 장식으로 숨긴다. */
  label?: string;
};

export function Icon(props: IconProps) {
  const { name, size = 20, className, label } = props;
  return (
    <svg
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}

import { Icon, type IconName } from "@/shared/components/icon";
import { cn } from "@/shared/utils";

// Figma Components › Admin / Stat Card. 라벨 + 아이콘 칸(톤) + 숫자(Title/1) + 응답 필드 이름(Mono/M).
const TONE = {
  sage: "bg-accent-sage-bg text-accent-sage-text",
  blue: "bg-accent-blue-bg text-accent-blue-text",
  lavender: "bg-primary-light text-primary-hover",
  mustard: "bg-accent-mustard-bg text-accent-mustard-text",
} as const;

type StatCardProps = { label: string; value: number; field: string; icon: IconName; tone: keyof typeof TONE };

export function StatCard(props: StatCardProps) {
  const { label, value, field, icon, tone } = props;
  return (
    <div className="flex flex-col gap-2.5 rounded-card border border-line-01 bg-background-01 px-6 pt-[23px] pb-[22px]">
      <div className="flex items-center justify-between">
        <p className="text-label-m text-content-02">{label}</p>
        <span className={cn("flex size-8 items-center justify-center rounded-control", TONE[tone])}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="font-display text-title-1 text-content-01 tabular-nums">{value.toLocaleString("ko-KR")}</p>
      <p className="font-mono text-mono-m text-content-03">{field}</p>
    </div>
  );
}

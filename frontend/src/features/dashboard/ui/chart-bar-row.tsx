// Figma Components › Admin / Chart Bar Row. 순위 + 제목 + 막대(1위 대비 길이) + 조회수.
type ChartBarRowProps = { rank: number; title: string; value: number; max: number };

export function ChartBarRow(props: ChartBarRowProps) {
  const { rank, title, value, max } = props;
  const percent = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <li className="flex h-9 items-center gap-4">
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-accent-blue-bg font-mono text-mono-m text-accent-blue-text">
        {rank}
      </span>
      <p className="w-60 shrink-0 truncate text-label-m text-content-01" title={title}>
        {title}
      </p>
      <span className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-md bg-background-04" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-md bg-chart-bar" style={{ width: `${percent}%` }} />
      </span>
      <span className="w-16 shrink-0 text-right font-mono text-mono-l text-content-02 tabular-nums">
        {value.toLocaleString("ko-KR")}회
      </span>
    </li>
  );
}

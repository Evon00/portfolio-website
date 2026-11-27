import type { DashboardSkillShare } from "@/shared/_controllers/_legacy-types";

// Figma Components › Admin / Donut Chart. 상위 5개 + 기타, 가운데 합계.
const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];
const OTHER = "var(--color-chart-other)";
const SIZE = 188;
const STROKE = 34;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type DonutChartProps = { shares: DashboardSkillShare[]; unit: string };

export function DonutChart({ shares, unit }: DonutChartProps) {
  const total = shares.reduce((sum, share) => sum + share.count, 0);
  const top = shares.slice(0, 5).map((share, i) => ({ ...share, color: COLORS[i] }));
  const rest = total - top.reduce((sum, share) => sum + share.count, 0);
  const segments = rest > 0 ? [...top, { name: "기타", count: rest, color: OTHER }] : top;

  let offset = 0;
  return (
    <div className="flex items-center gap-7">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden>
          {total === 0 ? (
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={OTHER} strokeWidth={STROKE} />
          ) : (
            segments.map((segment) => {
              const length = (segment.count / total) * CIRCUMFERENCE;
              const circle = (
                <circle
                  key={segment.name}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return circle;
            })
          )}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="font-display text-title-2 text-content-01 tabular-nums">{total}</span>
          <span className="text-caption text-content-03">{unit}</span>
        </p>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
        {segments.map((segment) => (
          <li key={segment.name} className="flex items-center gap-2.5 font-mono text-mono-l">
            <span className="size-3 shrink-0 rounded-sm" style={{ background: segment.color }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-content-01">{segment.name}</span>
            <span className="text-content-02 tabular-nums">{Math.round((segment.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { SkillStatsView } from "@/shared/_controllers/stats";

// Figma Components › Admin / Donut Chart. 상위 N개 + 기타, 가운데 합계.
// 상위 N개와 기타 묶음, 퍼센트(합계 100)는 서버가 계산해 준다.
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

type DonutChartProps = { stats: SkillStatsView; unit: string };

export function DonutChart({ stats, unit }: DonutChartProps) {
  const { total, shares } = stats;
  const segments = shares.map((share, i) => ({ ...share, color: share.etc ? OTHER : COLORS[i % COLORS.length] }));

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
            <span className="text-content-02 tabular-nums">{segment.ratio}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils";
import { SkillTag, SkillTagMore, type SkillTagTone, type SkillView } from "./skill";

// 카드의 기술 태그 한 줄 (Figma 카드 규칙): 폭에 들어가는 만큼 채우고 넘치는 개수는 +N으로 묶어 카드 높이를 고정한다.
// 보이지 않는 측정용 줄에 모든 태그와 +N을 그려 두고, 폭이 바뀔 때마다 몇 개가 들어가는지 다시 센다.
// 서버 HTML은 모든 태그를 한 줄로 두고 넘치는 부분을 잘라 보여 준다(높이는 같다).
// 태그 사이 간격: 카드 4px, 어드민 목록 표 6px(Figma 표 셀).
const GAP = { sm: "gap-1", md: "gap-1.5" } as const;

type SkillTagRowProps = {
  skills: SkillView[];
  tone?: SkillTagTone;
  gap?: keyof typeof GAP;
  className?: string;
};

export function SkillTagRow(props: SkillTagRowProps) {
  const { skills, tone, gap = "sm", className } = props;
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(skills.length);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const fit = () => {
      const [more, ...tags] = Array.from(measure.children, (el) => el.getBoundingClientRect().width);
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      const available = row.clientWidth;
      let used = 0;
      let fitted = 0;
      for (let i = 0; i < tags.length; i++) {
        const next = used + (i > 0 ? gap : 0) + tags[i];
        const needsMore = i < tags.length - 1;
        if (next + (needsMore ? gap + more : 0) > available) break;
        used = next;
        fitted = i + 1;
      }
      setCount(fitted);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [skills]);

  const rest = skills.slice(count);
  return (
    // contain: inline-size — 잘려 있어도 모든 태그 폭이 카드 최소 폭으로 잡혀 캐러셀·그리드가 넓어지지 않게 한다.
    <div
      ref={rowRef}
      className={cn("relative flex items-center overflow-hidden [contain:inline-size]", GAP[gap], className)}
    >
      {skills.slice(0, count).map((skill) => (
        <SkillTag key={skill.name} skill={skill} tone={tone} />
      ))}
      {rest.length > 0 && (
        <>
          <span aria-hidden>
            <SkillTagMore count={rest.length} tone={tone} />
          </span>
          <span className="sr-only">외 {rest.map((skill) => skill.name).join(", ")}</span>
        </>
      )}
      <div ref={measureRef} aria-hidden className={cn("invisible absolute top-0 left-0 flex", GAP[gap])}>
        <SkillTagMore count={skills.length} tone={tone} />
        {skills.map((skill) => (
          <SkillTag key={skill.name} skill={skill} tone={tone} />
        ))}
      </div>
    </div>
  );
}

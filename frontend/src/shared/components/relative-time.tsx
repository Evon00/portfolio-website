"use client";

import { useEffect, useState } from "react";

// HTML에는 실제 날짜(YYYY-MM-DD)를 넣고, 브라우저에서 "3일 전"처럼 바꿔 보여 준다 (설계 문서 6절).
// 7일이 넘으면 날짜를 그대로 둔다 (Figma 블로그 목록: "6일 전" · "2026-11-05").
const formatter = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
const DAY = 24 * 60 * 60 * 1000;

function toRelative(date: Date, now: number) {
  const diff = date.getTime() - now;
  const days = Math.round(diff / DAY);
  if (Math.abs(days) >= 7) return null;
  if (days !== 0) return formatter.format(days, "day");
  const hours = Math.round(diff / (60 * 60 * 1000));
  if (hours !== 0) return formatter.format(hours, "hour");
  const minutes = Math.round(diff / (60 * 1000));
  return minutes === 0 ? "방금 전" : formatter.format(minutes, "minute");
}

export function RelativeTime({ dateTime, className }: { dateTime: string; className?: string }) {
  const date = new Date(dateTime);
  const absolute = dateTime.slice(0, 10);
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    // 서버 HTML과 같은 날짜로 그린 뒤, 마운트 후 한 번 상대 시간으로 바꾼다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(toRelative(date, Date.now()) ?? absolute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTime]);

  return (
    <time dateTime={dateTime} className={className}>
      {label}
    </time>
  );
}

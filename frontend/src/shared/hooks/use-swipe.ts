"use client";

import { type PointerEvent, useRef } from "react";

// 좌우로 끌어 넘기기(Figma Gallery Input=Touch). 40px 이상 움직이면 이전/다음으로 본다.
const THRESHOLD = 40;

export function useSwipe(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null);

  return {
    onPointerDown(event: PointerEvent) {
      startX.current = event.clientX;
    },
    onPointerUp(event: PointerEvent) {
      if (startX.current === null) return;
      const dx = event.clientX - startX.current;
      startX.current = null;
      if (dx > THRESHOLD) onPrev();
      else if (dx < -THRESHOLD) onNext();
    },
    onPointerCancel() {
      startX.current = null;
    },
  };
}

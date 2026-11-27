"use client";

import { type RefObject, useEffect, useRef } from "react";

// 페이지 단위 캐러셀을 끌어서 넘긴다: 터치 스와이프 · 마우스 드래그 · 트랙패드 좌우 스와이프(가로 휠).
// · 8px 이상 가로로 움직이면 드래그로 보고 트랙이 손가락을 따라온다. 그때 놓을 때의 클릭(카드 링크·버튼)은 막는다.
// · 놓으면 가장 가까운 페이지로 스냅하고, 빠르게 튕기면(flick) 반 페이지가 안 돼도 한 장 넘긴다. 양 끝에서는 덜 끌린다.
// · 세로로 먼저 움직이면 드래그가 아니다(페이지 스크롤). 뷰포트에 touch-action: pan-y를 둔다.
// 트랙에는 드래그 중 data-dragging 속성과 --drag-offset(px)을 단다. 전환 애니메이션·커서는 CSS가 맡는다.
const DRAG_THRESHOLD = 8;
const FLICK_VELOCITY = 0.4; // px/ms
const WHEEL_THRESHOLD = 40;
const WHEEL_IDLE_MS = 250;

type SwipePagerOptions = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function useSwipePager(
  viewportRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  options: SwipePagerOptions,
) {
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let start: { x: number; y: number; id: number; time: number } | null = null;
    let dragging = false;
    let suppressClick = false;
    let wheelTotal = 0;
    let wheelLocked = false;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;

    const clamp = (page: number) => Math.min(Math.max(page, 0), latest.current.pageCount - 1);
    const setOffset = (px: number) => track.style.setProperty("--drag-offset", `${px}px`);
    const setDragging = (on: boolean) => track.toggleAttribute("data-dragging", on);
    // 첫 페이지에서 오른쪽, 마지막 페이지에서 왼쪽으로는 1/3만 따라온다.
    const resist = (dx: number) => {
      const { page, pageCount } = latest.current;
      return (page === 0 && dx > 0) || (page >= pageCount - 1 && dx < 0) ? dx / 3 : dx;
    };
    const pageStep = () => track.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId, time: event.timeStamp };
      dragging = false;
      suppressClick = false;
    }

    function onPointerMove(event: PointerEvent) {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          start = null;
          return;
        }
        dragging = true;
        suppressClick = true;
        viewport!.setPointerCapture(event.pointerId);
        setDragging(true);
        window.getSelection()?.removeAllRanges();
      }
      event.preventDefault();
      setOffset(resist(dx));
    }

    function finish(event: PointerEvent, cancelled: boolean) {
      if (!start || event.pointerId !== start.id) return;
      const from = start;
      start = null;
      if (!dragging) return;
      dragging = false;
      const { page, onPageChange } = latest.current;
      const dx = cancelled ? 0 : event.clientX - from.x;
      const velocity = dx / Math.max(1, event.timeStamp - from.time);
      let target = clamp(page - Math.round(dx / pageStep()));
      if (target === page && Math.abs(velocity) > FLICK_VELOCITY) target = clamp(page - Math.sign(dx));
      // 놓을 때의 클릭은 바로 이어서 오므로, 그 뒤(키보드 Enter 등)의 클릭까지 막지 않게 곧 풀어 둔다.
      setTimeout(() => (suppressClick = false), 0);
      // 드래그를 끄면 전환이 다시 켜지고, 끈 자리에서 새 페이지로 미끄러진다.
      setDragging(false);
      setOffset(0);
      if (target !== page) onPageChange(target);
    }
    const onPointerUp = (event: PointerEvent) => finish(event, false);
    const onPointerCancel = (event: PointerEvent) => finish(event, true);

    // 드래그로 끝난 손가락·마우스의 클릭은 카드 링크·아이콘 버튼에 닿기 전에 막는다.
    function onClick(event: MouseEvent) {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }

    // 링크·이미지를 끌어 놓는 브라우저 기본 동작(유령 이미지)을 막는다.
    const onDragStart = (event: DragEvent) => event.preventDefault();

    // 트랙패드 좌우 스와이프: 한 번의 동작(관성 포함)에 한 장만 넘긴다.
    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelLocked = false;
        wheelTotal = 0;
      }, WHEEL_IDLE_MS);
      if (wheelLocked) return;
      wheelTotal += event.deltaX;
      if (Math.abs(wheelTotal) < WHEEL_THRESHOLD) return;
      wheelLocked = true;
      const { page, onPageChange } = latest.current;
      const target = clamp(page + Math.sign(wheelTotal));
      if (target !== page) onPageChange(target);
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerCancel);
    viewport.addEventListener("click", onClick, true);
    viewport.addEventListener("dragstart", onDragStart);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(wheelTimer);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerCancel);
      viewport.removeEventListener("click", onClick, true);
      viewport.removeEventListener("dragstart", onDragStart);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [viewportRef, trackRef]);
}

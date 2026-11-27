"use client";

import { type DragEvent, type KeyboardEvent, useState } from "react";

// 끌어서 순서 바꾸기 (Figma Order Item · Gallery Tile). 라이브러리 없이 HTML 드래그 앤 드롭을 쓴다(어드민은 데스크톱 전용).
// - 손잡이를 눌렀을 때만 항목이 끌리게 해, 항목 안 입력칸(이미지 설명)은 그대로 쓸 수 있다.
// - 키보드: 손잡이에 초점을 두고 ↑↓(가로 목록은 ←→)로 한 칸씩 옮긴다.
export function moveItem<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function useReorder<T>(items: T[], onChange: (next: T[]) => void) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    onChange(moveItem(items, from, to));
  };

  return {
    dragging,
    itemProps: (index: number) => ({
      draggable: armed === index,
      onDragStart: (event: DragEvent) => {
        event.dataTransfer.effectAllowed = "move";
        setDragging(index);
      },
      onDragOver: (event: DragEvent) => {
        if (dragging === null) return;
        event.preventDefault();
        if (dragging !== index) {
          move(dragging, index);
          setDragging(index);
        }
      },
      onDrop: (event: DragEvent) => event.preventDefault(),
      onDragEnd: () => {
        setDragging(null);
        setArmed(null);
      },
    }),
    handleProps: (index: number, label: string) => ({
      "aria-label": `${label} 순서 바꾸기 (화살표 키로 이동)`,
      onPointerDown: () => setArmed(index),
      onPointerUp: () => setArmed(null),
      onKeyDown: (event: KeyboardEvent) => {
        const step = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[event.key];
        if (!step) return;
        event.preventDefault();
        const target = event.currentTarget as HTMLElement;
        move(index, index + step);
        // 옮긴 뒤에도 같은 항목의 손잡이에 초점을 둔다.
        requestAnimationFrame(() => {
          const handles = target.closest("[data-reorder-list]")?.querySelectorAll<HTMLElement>("[data-reorder-handle]");
          handles?.[Math.min(Math.max(index + step, 0), items.length - 1)]?.focus();
        });
      },
      "data-reorder-handle": "",
    }),
  };
}

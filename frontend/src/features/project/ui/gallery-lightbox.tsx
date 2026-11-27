"use client";

import { useEffect, useRef } from "react";
import { useSwipe } from "@/shared/hooks";
import { CarouselArrow } from "@/shared/components/carousel-controls";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/utils";
import type { GalleryImage } from "./gallery";

// Figma Components › Gallery Lightbox. 이미지 크게 보기.
// 이미지는 원본 비율 유지(최대 화면의 75%). Desktop: 좌우 화살표 · ←/→ 키 · 썸네일, Esc/배경/✕로 닫기.
// Mobile: 스와이프, 점 표시. 순서는 점·썸네일로만 표시(번호 없음).
// Figma 배경 rgba(23,20,33,0.92)와 설명 15px/1.5는 토큰에 없는 값이라 그대로 옮긴다.
type GalleryLightboxProps = {
  images: GalleryImage[];
  open: boolean;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export function GalleryLightbox(props: GalleryLightboxProps) {
  const { images, open, index, onIndexChange, onClose } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const last = images.length - 1;
  const prev = () => onIndexChange(Math.max(0, index - 1));
  const next = () => onIndexChange(Math.min(last, index + 1));
  const swipe = useSwipe(prev, next);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const image = images[index];

  return (
    <dialog
      ref={ref}
      aria-label="이미지 크게 보기"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") prev();
        if (event.key === "ArrowRight") next();
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        "m-0 h-dvh max-h-none w-screen max-w-none flex-col items-center gap-fluid-16-20 bg-[rgb(23_20_33/0.92)] px-fluid-16-40 pt-fluid-16-28 pb-fluid-24-32 open:flex",
        "opacity-0 transition-[opacity,display,overlay] transition-discrete duration-(--duration-fade) open:opacity-100 starting:open:opacity-0 backdrop:bg-transparent",
      )}
    >
      <div className="flex w-full justify-end">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-pill bg-white/12 text-content-inverse"
        >
          <Icon name="close" />
        </button>
      </div>

      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center gap-8"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <CarouselArrow direction="prev" disabled={index === 0} onClick={prev} className="hidden xl:flex" />
        {image && (
          // 원본 비율 유지: 크기를 정하지 않고 화면의 75%까지만 커지게 한다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.caption ?? ""}
            {...swipe}
            className="max-h-[75vh] max-w-full touch-pan-y touch-pinch-zoom rounded-xl object-contain select-none xl:max-w-[min(1280px,75vw)] xl:rounded-2xl"
            draggable={false}
          />
        )}
        <CarouselArrow direction="next" disabled={index === last} onClick={next} className="hidden xl:flex" />
      </div>

      {image?.caption && (
        <p className="text-center text-[13px] leading-[1.5] text-[var(--color-paper-300)] xl:text-[15px]">
          {image.caption}
        </p>
      )}

      {/* Desktop 썸네일 · Mobile 점 */}
      <ul className="hidden gap-2.5 xl:flex">
        {images.map((item, i) => (
          <li key={item.url}>
            <button
              type="button"
              aria-label={`이미지 ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => onIndexChange(i)}
              className={cn(
                "block h-[54px] w-24 overflow-hidden rounded-lg bg-background-05 bg-cover bg-center",
                i === index ? "border-2 border-[var(--color-lavender-400)]" : "opacity-50",
              )}
              style={{ backgroundImage: `url("${item.url}")` }}
            />
          </li>
        ))}
      </ul>
      <div className="flex gap-1.5 xl:hidden" aria-hidden>
        {images.map((item, i) => (
          <span
            key={item.url}
            className={cn("size-2 rounded-full", i === index ? "bg-content-inverse" : "bg-white/40")}
          />
        ))}
      </div>
      <p className="text-[12px] leading-[1.5] text-[var(--color-ink-400)] xl:hidden">
        좌우로 넘겨 보기 · 두 손가락으로 확대
      </p>
    </dialog>
  );
}

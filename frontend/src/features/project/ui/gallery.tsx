"use client";

import Image from "next/image";
import { useState } from "react";
import { useSwipe } from "@/shared/hooks";
import { CarouselArrow } from "@/shared/components/carousel-controls";
import { ImagePlaceholder } from "@/shared/components/image-placeholder";
import { cn } from "@/shared/utils";
import { GalleryLightbox } from "./gallery-lightbox";

export type GalleryImage = { url: string; caption: string | null };

// Figma Components › Gallery. 프로젝트 상세 이미지 갤러리.
// 1280 이상(Pointer): 좌우 화살표 + 썸네일 클릭. 미만(Touch): 메인 이미지 스와이프 + 썸네일 탭.
// 전환: Dissolve 200ms ease-out. 메인 이미지를 누르면 크게 보기(Lightbox)가 같은 index로 열린다.
// 이미지가 없으면 Image Placeholder(프로젝트 16:9)만 보여 주고 캡션·썸네일·화살표는 숨긴다.
export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const last = images.length - 1;
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(last, i + 1));
  const swipe = useSwipe(prev, next);

  if (images.length === 0) {
    return <ImagePlaceholder purpose="project" ratio="16:9" className="rounded-2xl xl:rounded-pill" />;
  }

  const caption = images[index]?.caption;

  return (
    <div className="flex flex-col items-center gap-fluid-10-14">
      <div
        className="relative aspect-video w-full touch-pan-y overflow-hidden rounded-2xl bg-background-05 xl:rounded-pill"
        {...swipe}
      >
        {images.map((image, i) => (
          <button
            key={image.url}
            type="button"
            tabIndex={i === index ? 0 : -1}
            aria-hidden={i !== index}
            aria-label={`${title} 이미지 ${i + 1} 크게 보기`}
            onClick={() => setLightboxOpen(true)}
            className={cn(
              "absolute inset-0 transition-opacity duration-(--duration-fade) ease-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={image.url}
              alt={image.caption ?? ""}
              fill
              sizes="(min-width: 1280px) 1120px, 100vw"
              loading={i === 0 ? "eager" : undefined}
              fetchPriority={i === 0 ? "high" : undefined}
              className="object-cover"
            />
          </button>
        ))}
        <CarouselArrow
          direction="prev"
          disabled={index === 0}
          onClick={prev}
          className="absolute top-1/2 left-3.5 hidden -translate-y-1/2 xl:flex"
        />
        <CarouselArrow
          direction="next"
          disabled={index === last}
          onClick={next}
          className="absolute top-1/2 right-3.5 hidden -translate-y-1/2 xl:flex"
        />
      </div>

      {caption && <p className="text-caption text-content-03 xl:text-body-m">{caption}</p>}

      {images.length > 1 && (
        <ul className="flex max-w-full gap-fluid-8-12 overflow-x-auto">
          {images.map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                aria-label={`이미지 ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative block aspect-[132/82.5] w-fluid-72-132 overflow-hidden rounded-lg bg-background-05 xl:rounded-xl",
                  i === index ? "border-3 border-primary" : "border-[1.5px] border-line-03",
                )}
              >
                <Image src={image.url} alt="" fill sizes="132px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <GalleryLightbox
        images={images}
        open={lightboxOpen}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

import { cn } from "@/shared/utils";
import { PaperAsset } from "@/shared/components/paper/paper-asset";

// Figma Components › Error Visual. 404 / 500 화면 상단 종이 콜라주.
// Figma는 좁은 화면에서 글자까지 포함해 콜라주 전체를 같은 비율로 줄인다(375 → 0.598배).
// 그래서 모든 값을 콜라주 폭 기준 cqw로 적는다. 최대 폭(560·520)에서는 Figma px·토큰 값과 같다.
export function ErrorVisual({ type, className }: { type: "404" | "500"; className?: string }) {
  if (type === "404") {
    // 기준 폭 560px: 1cqw = 5.6px
    return (
      <div className={cn("w-full max-w-[560px] [container-type:inline-size]", className)}>
        <div className="relative aspect-[560/361] w-full">
          <PaperAsset name="blob-lavender-surprised" className="top-0 left-[30.357cqw] h-[26.19cqw] w-[39.286cqw]" />
          <PaperAsset name="panel-cream-wide" className="top-[21.071cqw] left-0 h-[43.393cqw] w-full" />
          <PaperAsset
            name="tape-yellow"
            className="top-[18.571cqw] left-[4.286cqw] h-[6.084cqw] w-[21.429cqw] rotate-8"
          />
          <PaperAsset name="tape-sage" className="top-[58.75cqw] left-[76.429cqw] h-[7.5cqw] w-[20cqw] -rotate-6" />
          <p className="absolute top-[31.071cqw] w-full text-center font-mono text-[2.321cqw] leading-[3.036cqw] text-content-03">
            404 Not Found
          </p>
          <p className="absolute top-[35.893cqw] w-full text-center font-display text-[20cqw] leading-[20cqw] tracking-[0.714cqw] text-primary-strong">
            404
          </p>
        </div>
      </div>
    );
  }

  // 기준 폭 520px: 1cqw = 5.2px. Figma 문구 색 #2f3a52는 토큰에 없어 content-01을 쓴다.
  return (
    <div className={cn("w-full max-w-[520px] [container-type:inline-size]", className)}>
      <div className="relative aspect-[520/293] w-full">
        <PaperAsset name="blob-lavender-sleepy" className="top-0 left-[29.808cqw] h-[25.351cqw] w-[40.385cqw]" />
        <PaperAsset name="panel-blue-wide" className="top-[20cqw] left-0 h-[36.346cqw] w-full" />
        <PaperAsset
          name="tape-beige"
          className="top-[17.308cqw] left-[71.923cqw] h-[6.006cqw] w-[22.308cqw] -rotate-7"
        />
        <span className="absolute top-[30cqw] left-[43.846cqw] flex size-[12.308cqw] items-center justify-center rounded-full bg-content-inverse text-info">
          {/* 아이콘 크기도 cqw로 줄어야 해서 Icon 대신 스프라이트를 직접 쓴다. */}
          <svg aria-hidden className="size-[6.154cqw]">
            <use href="/icons/sprite.svg#wifi-off" />
          </svg>
        </span>
        <p className="absolute top-[44.615cqw] w-full text-center font-mono text-[2.5cqw] leading-[3.269cqw] text-content-01">
          500 Internal Server Error · Network Error
        </p>
      </div>
    </div>
  );
}

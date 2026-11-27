import Image from "next/image";
import { cn } from "@/shared/utils";

// Figma _assets의 캐릭터·종이·테이프. Figma는 모든 인스턴스에서 원본을 자르지 않고 노드 크기에 맞춰 늘려 쓰므로
// (imageTransform = identity) 부모 박스를 채우는 object-fill로 그린다. 이미 WebP로 줄여 두어 최적화는 끈다.
const ASSETS = {
  "blob-blue-sleepy": "/images/blobs/blob-blue-sleepy.webp",
  "blob-cream-smile": "/images/blobs/blob-cream-smile.webp",
  "blob-lavender-sleepy": "/images/blobs/blob-lavender-sleepy.webp",
  "blob-lavender-surprised": "/images/blobs/blob-lavender-surprised.webp",
  "blob-mustard-happy": "/images/blobs/blob-mustard-happy.webp",
  "blob-sage-smile": "/images/blobs/blob-sage-smile.webp",
  "panel-blue-wide": "/images/panels/panel-blue-wide.webp",
  "panel-cream-wide": "/images/panels/panel-cream-wide.webp",
  "panel-grid-notepad": "/images/panels/panel-grid-notepad.webp",
  "panel-lavender-wide": "/images/panels/panel-lavender-wide.webp",
  "panel-sage-portrait": "/images/panels/panel-sage-portrait.webp",
  "tape-beige": "/images/tapes/tape-beige.webp",
  "tape-lavender": "/images/tapes/tape-lavender.webp",
  "tape-lavender-check": "/images/tapes/tape-lavender-check.webp",
  "tape-sage": "/images/tapes/tape-sage.webp",
  "tape-yellow": "/images/tapes/tape-yellow.webp",
} as const;

export type PaperAssetName = keyof typeof ASSETS;

type PaperAssetProps = {
  name: PaperAssetName;
  /** 위치·크기를 정하는 박스 클래스. 이미지는 이 박스를 꽉 채운다. */
  className?: string;
  /** 첫 화면의 큰 장식(히어로 · 로그인)이면 바로 받는다(Next 16 권장: loading="eager" + fetchPriority="high"). */
  priority?: boolean;
};

export function PaperAsset(props: PaperAssetProps) {
  const { name, className, priority } = props;
  return (
    <span aria-hidden className={cn("pointer-events-none absolute block", className)}>
      <Image
        src={ASSETS[name]}
        alt=""
        fill
        unoptimized
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className="object-fill"
      />
    </span>
  );
}

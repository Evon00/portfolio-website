import { cn } from "@/shared/utils";
import { PaperAsset, type PaperAssetName } from "@/shared/components/paper/paper-asset";

// Figma Components › Image Placeholder. 이미지 값이 비었을 때 용도별 고정 대체 이미지.
// 프로젝트=파랑(16:9 캐러셀·갤러리 / 16:10 그리드), 게시글=머스타드(16:10 Row·Stack / 1:1 Item),
// 프로필=라벤더, 스킬=세이지. 크기는 부모가 정하고 종이·캐릭터는 비율대로 따라온다.
type Purpose = "project" | "post" | "profile" | "skill";
type Ratio = "16:10" | "16:9" | "1:1";

const PURPOSE: Record<Purpose, { bg: string; panel: PaperAssetName; blob: PaperAssetName; round: string }> = {
  project: { bg: "bg-accent-blue-bg", panel: "panel-blue-wide", blob: "blob-blue-sleepy", round: "rounded-xl" },
  post: { bg: "bg-accent-mustard-bg", panel: "panel-cream-wide", blob: "blob-mustard-happy", round: "rounded-xl" },
  profile: {
    bg: "bg-primary-light",
    panel: "panel-lavender-wide",
    blob: "blob-lavender-sleepy",
    round: "rounded-full",
  },
  skill: { bg: "bg-accent-sage-bg", panel: "panel-sage-portrait", blob: "blob-sage-smile", round: "rounded-3xl" },
};

// 캐릭터 위치(Figma inset %, top right bottom left)
const BLOB_INSET: Record<string, string> = {
  "project:16:10": "top-[61.97%] right-[29%] -bottom-[8%] left-[29%]",
  "project:16:9": "top-[56.86%] right-[29%] -bottom-[8%] left-[29%]",
  "post:16:10": "top-[64.09%] right-[27%] -bottom-[8%] left-[27%]",
  "post:1:1": "top-[65.04%] right-[14%] -bottom-[8%] left-[14%]",
  "profile:1:1": "top-[57.78%] right-[10%] -bottom-[8%] left-[10%]",
  "skill:1:1": "top-[32.55%] right-[2%] bottom-[4%] left-[2%]",
};

const ASPECT: Record<Ratio, string> = { "16:10": "aspect-[16/10]", "16:9": "aspect-[16/9]", "1:1": "aspect-square" };

type ImagePlaceholderProps = {
  purpose: Purpose;
  ratio: Ratio;
  /** 라운드를 부모(카드 썸네일 등)에 맞춰 바꿀 때 */
  className?: string;
};

export function ImagePlaceholder(props: ImagePlaceholderProps) {
  const { purpose, ratio, className } = props;
  const p = PURPOSE[purpose];
  return (
    <div aria-hidden className={cn("relative w-full overflow-hidden", ASPECT[ratio], p.bg, p.round, className)}>
      <PaperAsset name={p.panel} className="-inset-x-[12%] -inset-y-[18%]" />
      <PaperAsset name={p.blob} className={BLOB_INSET[`${purpose}:${ratio}`]} />
    </div>
  );
}

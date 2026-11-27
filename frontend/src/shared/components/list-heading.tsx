import type { ReactNode } from "react";
import { cn } from "@/shared/utils";
import { PaperAsset, type PaperAssetName } from "@/shared/components/paper/paper-asset";
import { PageTitle } from "./title";

// Figma 목록 페이지 › page heading. 제목(테이프) + "총 N개의 …" + 오른쪽 캐릭터.
type ListHeadingProps = {
  title: string;
  tape?: "lilac" | "sage";
  count: ReactNode;
  character: { name: PaperAssetName; className: string };
  className?: string;
};

export function ListHeading(props: ListHeadingProps) {
  const { title, tape, count, character, className } = props;
  return (
    <div className={cn("flex items-end justify-between", className)}>
      <div className="flex flex-col gap-3.5">
        <PageTitle tape={tape}>{title}</PageTitle>
        {count}
      </div>
      <span className={cn("relative shrink-0", character.className)}>
        <PaperAsset name={character.name} className="inset-0" />
      </span>
    </div>
  );
}

/** "총 8개의 프로젝트" — 숫자만 Label/L */
export function TotalCount({ count, unit }: { count: number; unit: string }) {
  return (
    <p className="flex items-baseline text-body-l text-content-02">
      총&nbsp;<strong className="text-label-l text-content-01">{count}</strong>
      {unit}
    </p>
  );
}

"use client";

import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { Icon } from "@/shared/components/icon";
import { type ImageAlign, toImageAlign } from "@/shared/libs/markdown/block-style";
import { cn } from "@/shared/utils";
import { IMAGE_ALIGN_ITEMS } from "./editor-toolbar";

// Figma Components › Editor / Image Block.
// 설명(캡션)은 마크다운 title 자리에 저장한다: ![대체텍스트](주소 "설명") (설계 문서 10절).
// · 설명 있음: 늘 보이고, 눌러서 바로 고친다(테두리 없는 입력칸).
// · 설명 없음: 평소엔 숨기고, 이미지를 고르면 "설명 추가"로 입력칸을 연다. 비워 둬도 된다.
// 정렬: 툴바 왼쪽 4개 버튼(왼쪽·가운데·오른쪽·전체 폭). 전체 폭은 100%, 나머지는 60% 폭으로 위치만 바꾼다
// (공개 화면 prose.css의 md-image-*와 같은 모양). 크기 조절(작게·중간·크게)은 하지 않는다(설계 문서 1절).
const LAYOUT: Record<ImageAlign, { box: string; caption: string }> = {
  full: { box: "items-center", caption: "text-center" },
  left: { box: "items-start", caption: "text-left" },
  center: { box: "items-center", caption: "text-center" },
  right: { box: "items-end", caption: "text-right" },
};

export function ImageBlockView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const align = toImageAlign(node.attrs.align);
  const caption = (node.attrs.title as string | null) ?? "";
  const [captionOpen, setCaptionOpen] = useState(false);
  const showCaption = caption !== "" || captionOpen;

  return (
    <NodeViewWrapper className="my-6 flex flex-col gap-2.5" data-drag-handle>
      {selected && (
        <div
          contentEditable={false}
          className="flex items-center gap-0.5 self-center rounded-control border border-line-01 bg-content-inverse p-1 shadow-panel"
        >
          {IMAGE_ALIGN_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              title={item.label}
              aria-label={`이미지 ${item.label}`}
              aria-pressed={align === item.value}
              onClick={() => updateAttributes({ align: item.value })}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                align === item.value
                  ? "bg-primary-subtle text-primary-hover"
                  : "text-content-02 hover:bg-background-04",
              )}
            >
              <Icon name={item.icon} size={16} />
            </button>
          ))}
          <span aria-hidden className="mx-1 h-[18px] w-px bg-line-02" />
          <button
            type="button"
            onClick={() => setCaptionOpen(true)}
            className={cn(
              "rounded-md px-2 py-1.5 text-[12px] leading-[18px] transition-colors",
              showCaption ? "text-content-02 hover:bg-primary-subtle" : "bg-primary-subtle text-primary-hover",
            )}
          >
            {caption ? "설명 편집" : "설명 추가"}
          </button>
        </div>
      )}
      <div className={cn("flex flex-col gap-2.5", LAYOUT[align].box)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 편집 중 이미지는 업로드 직후 blob: 주소라 next/image를 쓰지 않는다 */}
        <img
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string | null) ?? ""}
          className={cn(
            "h-auto rounded-2xl border-2 bg-background-05",
            align === "full" ? "w-full" : "w-[60%]",
            selected ? "border-primary" : "border-transparent",
          )}
        />
        {showCaption && (
          <input
            data-focus-box
            contentEditable={false}
            value={caption}
            autoFocus={captionOpen && caption === ""}
            onChange={(event) => updateAttributes({ title: event.target.value || null })}
            onBlur={() => setCaptionOpen(false)}
            placeholder="설명을 입력해 주세요"
            aria-label="이미지 설명"
            className={cn(
              "rounded-lg bg-transparent px-3 py-1.5 text-body-m text-content-03 outline-none placeholder:text-content-04 focus:bg-background-02",
              align === "full" ? "w-full" : "w-[60%]",
              LAYOUT[align].caption,
            )}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}

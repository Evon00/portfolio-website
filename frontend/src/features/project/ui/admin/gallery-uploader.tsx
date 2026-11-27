"use client";

import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { MAX_GALLERY_IMAGES } from "@/shared/libs/upload/upload-rules";
import { prepareImage } from "@/shared/libs/upload/upload-image";
import { useReorder } from "@/shared/hooks";
import { AdminPanel } from "@/shared/components/admin/panel";
import { FormMessage, TextField } from "@/shared/components/form";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/utils";

// Figma 프로젝트 작성 › 갤러리 이미지 + Upload / Gallery Tile.
// 첫 장이 대표(썸네일). 다른 장의 "대표"를 누르면 맨 앞으로 옮긴다. 끌어서 순서 변경, x로 삭제, 설명은 선택.
// 새 이미지는 고를 때 브라우저에서 변환만 해 두고(미리보기 blob:), 프로젝트를 저장할 때 함께 보낸다.
export type GalleryItem = {
  key: string;
  /** 저장된 이미지의 id. 새로 고른 이미지는 null */
  mediaId: number | null;
  url: string;
  caption: string;
  fileName: string;
  /** 새로 고른 이미지의 변환된 파일. 저장할 때 보낸다 */
  file?: File;
};

/** Spring 이미지 설명 한도 */
export const MAX_CAPTION_LENGTH = 50;

// onChange는 부모의 setState를 그대로 받는다. 변환이 끝난 뒤의 반영은 함수형 갱신으로 최신 목록에 한다.
type GalleryUploaderProps = { value: GalleryItem[]; onChange: Dispatch<SetStateAction<GalleryItem[]>> };

export function GalleryUploader({ value, onChange }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const update = onChange;
  const reorder = useReorder(value, update);
  const full = value.length >= MAX_GALLERY_IMAGES;

  async function addFiles(files: File[]) {
    setError(null);
    const room = MAX_GALLERY_IMAGES - value.length;
    if (files.length > room)
      setError("최대 10장까지 올릴 수 있어요. 새 이미지를 올리려면 기존 이미지를 먼저 지워 주세요.");
    const results = await Promise.allSettled(
      files.slice(0, Math.max(room, 0)).map((file) => prepareImage(file, "project")),
    );
    const added: GalleryItem[] = [];
    for (const [i, result] of results.entries()) {
      if (result.status === "rejected") {
        setError(result.reason instanceof Error ? result.reason.message : "이미지를 추가하지 못했어요.");
        continue;
      }
      added.push({
        key: crypto.randomUUID(),
        mediaId: null,
        url: URL.createObjectURL(result.value),
        caption: "",
        fileName: files[i].name,
        file: result.value,
      });
    }
    update((current) => [...current, ...added].slice(0, MAX_GALLERY_IMAGES));
  }

  return (
    <AdminPanel className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-label-m text-content-01">
          갤러리 이미지{" "}
          <span className="font-mono text-mono-l text-content-02">
            ({value.length}/{MAX_GALLERY_IMAGES})
          </span>
        </p>
        <p className="text-caption text-content-03">
          프로젝트 상세 상단 갤러리에 이 순서대로 보여요. 끌어서 순서를 바꾸고, 대표를 눌러 썸네일을 정해요. 이미지
          설명은 선택이에요.
          <br />
          추천 비율 16:9 · 최대 10장 · 장당 10MB 이하 · JPG, PNG, GIF, WebP
        </p>
      </div>

      <ul data-reorder-list className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-5">
        {value.map((item, index) => {
          const isThumbnail = index === 0;
          return (
            <li
              key={item.key}
              className={cn("flex flex-col gap-2", reorder.dragging === index && "opacity-50")}
              {...reorder.itemProps(index)}
            >
              <div
                className={cn(
                  "relative aspect-video overflow-hidden rounded-xl bg-background-05",
                  isThumbnail ? "border-2 border-primary" : "border border-line-01",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- 새 이미지는 저장 전 미리보기(blob:)라 next/image를 쓰지 않는다 */}
                <img src={item.url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute top-2 left-2 flex size-7 cursor-grab items-center justify-center rounded-xl bg-background-01 text-primary-strong"
                  {...reorder.handleProps(index, item.fileName)}
                >
                  <Icon name="drag-handle" size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`${item.fileName} 삭제`}
                  onClick={() => update(value.filter((other) => other.key !== item.key))}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-xl bg-background-01 text-primary-strong"
                >
                  <Icon name="close" size={16} />
                </button>
                <button
                  type="button"
                  aria-pressed={isThumbnail}
                  onClick={() => !isThumbnail && update([item, ...value.filter((other) => other.key !== item.key)])}
                  className={cn(
                    "absolute bottom-2 left-2 flex items-center gap-1 rounded-lg py-1 pr-2.5 pl-2 text-[12px] leading-[18px]",
                    isThumbnail
                      ? "bg-primary text-content-inverse"
                      : "border border-line-02 bg-background-01 text-content-03 hover:text-primary-hover",
                  )}
                >
                  <Icon name="check" size={12} />
                  대표
                </button>
              </div>
              <p className="truncate text-[13px] leading-5 text-content-01" title={item.fileName}>
                {item.fileName}
              </p>
              <TextField
                size="S"
                value={item.caption}
                onChange={(event) =>
                  update(
                    value.map((other) => (other.key === item.key ? { ...other, caption: event.target.value } : other)),
                  )
                }
                maxLength={MAX_CAPTION_LENGTH}
                placeholder="이미지 설명 (선택)"
                aria-label={`${item.fileName} 설명`}
                wrapperClassName="h-[34px] bg-background-01 px-2.5 focus-within:px-[9px]"
                className="text-[12px]"
              />
            </li>
          );
        })}
        {!full && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                if (!event.dataTransfer.types.includes("Files")) return;
                event.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDropActive(false);
                void addFiles(Array.from(event.dataTransfer.files));
              }}
              className={cn(
                "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl transition-colors",
                dropActive ? "bg-primary-subtle outline-2 outline-primary outline-dashed" : "bg-background-04",
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-content-02 text-content-inverse">
                <Icon name="plus" size={16} />
              </span>
              <span className="text-[12px] leading-[18px] text-content-03">이미지 추가</span>
            </button>
          </li>
        )}
      </ul>
      {(error || full) && (
        <FormMessage status="error">
          {error ?? "최대 10장까지 올릴 수 있어요. 새 이미지를 올리려면 기존 이미지를 먼저 지워 주세요."}
        </FormMessage>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) void addFiles(files);
        }}
      />
    </AdminPanel>
  );
}

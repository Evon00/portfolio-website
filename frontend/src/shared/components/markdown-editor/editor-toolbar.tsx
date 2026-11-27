"use client";

import { type ReactNode, useRef, useState } from "react";
import { useDismiss } from "@/shared/hooks";
import { Icon, type IconName } from "@/shared/components/icon";
import {
  type ImageAlign,
  LINE_HEIGHT_LABELS,
  LINE_HEIGHTS,
  type LineHeight,
  type TextAlign,
} from "@/shared/libs/markdown/block-style";
import { TextField } from "@/shared/components/form";
import { cn } from "@/shared/utils";
import { HEADING_LEVELS } from "./block-style-extensions";
import type { ToolbarAction } from "./toolbar-actions";
import { LanguageMenu } from "./language-menu";
import { HeadingGlyph, OptionMenu } from "./option-menu";

// Figma Markdown Editor › format bar: 제목 ▾ · 본문 | B I S | 정렬 3 · 줄간격 ▾ | 목록 · 번호 · 인용 | 링크 · 이미지 ▾ · 표 | 코드 · 코드 블록 ▾
export type ToolbarState = Partial<Record<ToolbarAction | "link" | "codeBlock", boolean>> & {
  /** 커서가 있는 블록의 제목 단계(본문이면 0) */
  heading?: number;
  align?: TextAlign;
  lineHeight?: LineHeight;
  /** 이미지가 선택돼 있으면 그 정렬 */
  imageAlign?: ImageAlign;
};

export const IMAGE_ALIGN_ITEMS: { value: ImageAlign; label: string; icon: IconName }[] = [
  { value: "left", label: "왼쪽", icon: "align-left" },
  { value: "center", label: "가운데", icon: "align-center" },
  { value: "right", label: "오른쪽", icon: "align-right" },
  { value: "full", label: "전체 폭", icon: "maximize" },
];

const TEXT_ALIGN_ITEMS: { value: TextAlign; label: string; icon: IconName }[] = [
  { value: "left", label: "왼쪽 정렬", icon: "align-left" },
  { value: "center", label: "가운데 정렬", icon: "align-center" },
  { value: "right", label: "오른쪽 정렬", icon: "align-right" },
];

type Menu = "heading" | "lineHeight" | "image" | "language" | null;

type EditorToolbarProps = {
  active: ToolbarState;
  onAction: (action: ToolbarAction) => void;
  /** 1~5: 제목, 0: 본문 */
  onHeading: (level: number) => void;
  onAlign: (align: TextAlign) => void;
  onLineHeight: (lineHeight: LineHeight) => void;
  onImageAlign: (align: ImageAlign) => void;
  onLink: (href: string | null) => void;
  /** 현재 링크 주소(편집 모드에서 링크 안에 커서가 있을 때) */
  currentLink?: string;
  onCodeBlock: (language: string) => void;
  /** 없으면 이미지 버튼을 숨긴다(프로젝트 본문) */
  onImage?: () => void;
  linkOpen: boolean;
  onLinkOpenChange: (open: boolean) => void;
};

export function EditorToolbar(props: EditorToolbarProps) {
  const {
    active,
    onAction,
    onHeading,
    onAlign,
    onLineHeight,
    onImageAlign,
    onLink,
    currentLink,
    onCodeBlock,
    onImage,
    linkOpen,
    onLinkOpenChange,
  } = props;
  const [menu, setMenu] = useState<Menu>(null);
  const close = () => setMenu(null);
  const toggle = (next: Exclude<Menu, null>) => setMenu((current) => (current === next ? null : next));

  const tool = (action: ToolbarAction, label: string, content: ReactNode) => (
    <ToolButton label={label} active={active[action]} onClick={() => onAction(action)}>
      {content}
    </ToolButton>
  );

  return (
    <div
      role="toolbar"
      aria-label="서식"
      className="flex flex-wrap items-center gap-0.5 border-b border-line-01 bg-background-01 px-3.5 py-1.5"
    >
      <MenuTool
        open={menu === "heading"}
        onClose={close}
        button={
          <ToolButton
            label="제목"
            active={Boolean(active.heading)}
            onClick={() => toggle("heading")}
            wide
            aria-haspopup="listbox"
            aria-expanded={menu === "heading"}
          >
            <TextGlyph>H</TextGlyph>
            <Icon name="chevron-down" size={12} />
          </ToolButton>
        }
      >
        <OptionMenu
          title="제목 크기"
          value={active.heading || undefined}
          items={HEADING_LEVELS.map((level) => ({
            value: level,
            label: `제목 ${level}`,
            leading: <HeadingGlyph level={level} />,
            hint: "#".repeat(level),
          }))}
          onSelect={(level) => {
            close();
            onHeading(level);
          }}
          onClose={close}
          className="absolute top-full left-0 z-30 mt-1 w-[260px]"
        />
      </MenuTool>
      <ToolButton label="본문" active={active.heading === 0} onClick={() => onHeading(0)} wide>
        <TextGlyph>본문</TextGlyph>
      </ToolButton>
      <Separator />
      {tool("bold", "굵게 (Ctrl+B)", <TextGlyph className="font-bold">B</TextGlyph>)}
      {tool("italic", "기울임 (Ctrl+I)", <TextGlyph className="italic">I</TextGlyph>)}
      {tool("strike", "취소선", <ToolIcon name="strike" />)}
      <Separator />
      {TEXT_ALIGN_ITEMS.map((item) => (
        <ToolButton
          key={item.value}
          label={item.label}
          active={active.align === item.value}
          onClick={() => onAlign(item.value)}
        >
          <ToolIcon name={item.icon} />
        </ToolButton>
      ))}
      <MenuTool
        open={menu === "lineHeight"}
        onClose={close}
        button={
          <ToolButton
            label="줄간격"
            active={Boolean(active.lineHeight && active.lineHeight !== "normal")}
            onClick={() => toggle("lineHeight")}
            wide
            aria-haspopup="listbox"
            aria-expanded={menu === "lineHeight"}
          >
            <ToolIcon name="line-height" />
            <Icon name="chevron-down" size={12} />
          </ToolButton>
        }
      >
        <OptionMenu
          title="줄간격"
          value={active.lineHeight}
          items={LINE_HEIGHTS.map((value) => ({
            value,
            label: LINE_HEIGHT_LABELS[value].label,
            leading: <Icon name="line-height" size={20} />,
            hint: LINE_HEIGHT_LABELS[value].value,
          }))}
          onSelect={(value) => {
            close();
            onLineHeight(value);
          }}
          onClose={close}
          className="absolute top-full left-0 z-30 mt-1 w-[260px]"
        />
      </MenuTool>
      <Separator />
      {tool("bullet", "목록", <ToolIcon name="list" />)}
      {tool("ordered", "번호 목록", <ToolIcon name="list-ordered" />)}
      {tool("quote", "인용", <ToolIcon name="quote" />)}
      <Separator />
      <LinkTool
        open={linkOpen}
        onOpenChange={onLinkOpenChange}
        active={active.link}
        currentLink={currentLink}
        onApply={onLink}
      />
      {/* 이미지 ▾: 이미지가 선택돼 있으면 정렬 메뉴(Figma Editor / Image Align Menu), 아니면 파일 선택 */}
      {onImage && (
        <MenuTool
          open={menu === "image"}
          onClose={close}
          button={
            <ToolButton
              label={active.imageAlign ? "이미지 정렬" : "이미지"}
              active={Boolean(active.imageAlign)}
              onClick={() => (active.imageAlign ? toggle("image") : onImage())}
              wide
            >
              <ToolIcon name="image" />
              <Icon name="chevron-down" size={12} />
            </ToolButton>
          }
        >
          <OptionMenu
            title="이미지 정렬"
            value={active.imageAlign}
            items={IMAGE_ALIGN_ITEMS.map((item) => ({
              value: item.value,
              label: item.label,
              leading: <Icon name={item.icon} size={18} />,
              divided: item.value === "full",
            }))}
            onSelect={(value) => {
              close();
              onImageAlign(value);
            }}
            onClose={close}
            className="absolute top-full left-0 z-30 mt-1 w-[220px]"
          />
        </MenuTool>
      )}
      {tool("table", "표", <ToolIcon name="table" />)}
      <Separator />
      {tool("code", "인라인 코드", <ToolIcon name="code" />)}
      <MenuTool
        open={menu === "language"}
        onClose={close}
        button={
          <ToolButton
            label="코드 블록 (Ctrl+Shift+C)"
            active={active.codeBlock}
            onClick={() => toggle("language")}
            wide
            aria-haspopup="listbox"
            aria-expanded={menu === "language"}
          >
            <ToolIcon name="code-block" />
            <Icon name="chevron-down" size={12} />
          </ToolButton>
        }
      >
        <LanguageMenu
          onSelect={(language) => {
            close();
            onCodeBlock(language);
          }}
          onClose={close}
          className="absolute top-full left-0 z-30 mt-1"
        />
      </MenuTool>
    </div>
  );
}

/** 버튼 + 그 아래 드롭다운. 바깥을 누르거나 Esc면 닫힌다. */
function MenuTool(props: { open: boolean; onClose: () => void; button: ReactNode; children: ReactNode }) {
  const { open, onClose, button, children } = props;
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, onClose);
  return (
    <div ref={ref} className="relative">
      {button}
      {open && children}
    </div>
  );
}

type ToolButtonProps = {
  label: string;
  active?: boolean;
  wide?: boolean;
  onClick: () => void;
  children: ReactNode;
  "aria-haspopup"?: "listbox" | "dialog";
  "aria-expanded"?: boolean;
};

function ToolButton(props: ToolButtonProps) {
  const { label, active, wide, onClick, children, ...aria } = props;
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 items-center justify-center gap-0.5 rounded-lg transition-colors",
        wide ? "px-1.5" : "w-8",
        active ? "bg-primary-subtle text-primary-hover" : "text-content-02 hover:bg-background-04",
      )}
      {...aria}
    >
      {children}
    </button>
  );
}

function ToolIcon({ name }: { name: IconName }) {
  return <Icon name={name} size={18} />;
}

function TextGlyph({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-[13px] leading-5 font-bold", className)}>{children}</span>;
}

function Separator() {
  return <span aria-hidden className="mx-1.5 h-[18px] w-px bg-line-02" />;
}

type LinkToolProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active?: boolean;
  currentLink?: string;
  onApply: (href: string | null) => void;
};

/** 링크 버튼 · Ctrl+K: 주소 입력칸을 띄운다. 비우고 적용하면 링크를 지운다. */
function LinkTool(props: LinkToolProps) {
  const { open, onOpenChange, active, currentLink, onApply } = props;
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => onOpenChange(false));

  return (
    <div ref={ref} className="relative">
      <ToolButton
        label="링크 (Ctrl+K)"
        active={active}
        onClick={() => onOpenChange(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ToolIcon name="link" />
      </ToolButton>
      {open && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const href = String(new FormData(event.currentTarget).get("href") ?? "").trim();
            onApply(href || null);
            onOpenChange(false);
          }}
          className="absolute top-full left-0 z-30 mt-1 flex w-[320px] items-center gap-1.5 rounded-xl border border-line-01 bg-content-inverse p-1.5 shadow-panel"
        >
          <label className="sr-only" htmlFor="editor-link-input">
            링크 주소
          </label>
          <TextField
            size="S"
            id="editor-link-input"
            name="href"
            type="url"
            autoFocus
            defaultValue={currentLink}
            placeholder="https://"
            wrapperClassName="min-w-0 flex-1 bg-background-01"
          />
          <button type="submit" className="h-9 rounded-control bg-primary px-3 text-label-m text-content-inverse">
            적용
          </button>
        </form>
      )}
    </div>
  );
}

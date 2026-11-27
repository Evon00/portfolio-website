"use client";

import { NodeSelection } from "@tiptap/pm/state";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { type UploadImage, useImageUpload } from "@/shared/libs/upload/use-image-upload";
import { useDismiss } from "@/shared/hooks";
import { AlertDanger } from "@/shared/components/form";
import { Icon } from "@/shared/components/icon";
import {
  type ImageAlign,
  type LineHeight,
  type TextAlign,
  type TextBlockStyle,
  toImageAlign,
  toLineHeight,
  toTextAlign,
} from "@/shared/libs/markdown/block-style";
import { cn } from "@/shared/utils";
import { createExtensions } from "./extensions";
import { rememberLanguage } from "./languages";
import {
  applyMarkdownAction,
  applyMarkdownBlockStyle,
  applyMarkdownHeading,
  replaceRange,
  type TextEdit,
  type ToolbarAction,
  wrapSelection,
} from "./toolbar-actions";
import { EditorToolbar } from "./editor-toolbar";
import { MarkdownSource } from "./markdown-source";

// Figma Components › Markdown Editor. 편집(블로그 상세처럼 보이는 화면) / 마크다운(원문) 두 모드.
// 저장 형식은 마크다운 문자열 하나이고, 두 모드가 같은 문자열을 고친다(설계 문서 9절).
// 어드민 작성·수정 화면에서 next/dynamic으로만 불러온다(공개 번들에 넣지 않는다).
export type MarkdownEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  /** post: 본문에 이미지를 넣는다 · project: 이미지는 갤러리에서만 관리해 이미지 기능을 숨긴다 */
  kind: "post" | "project";
  /** 본문 이미지를 올리고 주소를 돌려준다(post에서만 쓴다). 업로드 API는 화면(폼)이 정한다. */
  uploadImage?: UploadImage;
  invalid?: boolean;
};

const NO_UPLOAD: UploadImage = async () => {
  throw new Error("이미지를 올릴 수 없는 에디터예요.");
};

type Mode = "edit" | "markdown";

const EDIT_HINT = "/ 블록 추가 · Ctrl+B 굵게 · Ctrl+K 링크 · Ctrl+Shift+C 코드 블록";
const MARKDOWN_HINT = "Ctrl+B 굵게 · Ctrl+K 링크 · Ctrl+Shift+C 코드 블록 · Tab 들여쓰기";
const SHORTCUTS = [
  ["/", "블록 추가"],
  ["Ctrl+B", "굵게"],
  ["Ctrl+I", "기울임"],
  ["Ctrl+K", "링크"],
  ["Ctrl+Shift+C", "코드 블록"],
  ["Tab", "코드 블록 안 들여쓰기"],
  ["Shift+Enter", "코드 블록 밖으로"],
] as const;

export default function MarkdownEditor(props: MarkdownEditorProps) {
  const { value, onChange, kind, uploadImage = NO_UPLOAD, invalid } = props;
  const [mode, setMode] = useState<Mode>("edit");
  const [fullscreen, setFullscreen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const imageUpload = useImageUpload(uploadImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const allowImages = kind === "post";
  // 에디터 설정(editorProps·onUpdate)은 처음 한 번 만들어지므로 최신 함수는 ref로 부른다.
  const latest = useRef({ onChange, insertFiles: (_files: File[]): boolean => false });

  // 확장은 한 번만 만든다. 이미지 버튼·/ 메뉴는 숨은 파일 선택 창을 연다.
  const extensions = useMemo(
    () => createExtensions({ onRequestImage: allowImages ? () => fileInputRef.current?.click() : undefined }),
    [allowImages],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: cn(
          "editor-content prose min-h-[460px] px-10 py-8 outline-none",
          kind === "post" ? "prose-blog" : "prose-project",
        ),
        "aria-label": "본문",
        ...(invalid ? { "aria-invalid": "true" } : {}),
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setLinkOpen(true);
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => latest.current.insertFiles(Array.from(event.clipboardData?.files ?? [])),
      handleDrop: (_view, event) =>
        latest.current.insertFiles(Array.from((event as DragEvent).dataTransfer?.files ?? [])),
    },
    onUpdate: ({ editor: current }) => latest.current.onChange(current.getMarkdown()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current) return null;
      const { selection } = current.state;
      const image = selection instanceof NodeSelection && selection.node.type.name === "image" ? selection.node : null;
      const block = current.isActive("heading") ? "heading" : "paragraph";
      const blockAttributes = current.getAttributes(block);
      return {
        active: {
          heading: image
            ? undefined
            : block === "heading"
              ? Number(blockAttributes.level)
              : current.isActive("paragraph")
                ? 0
                : undefined,
          align: toTextAlign(blockAttributes.align),
          lineHeight: toLineHeight(blockAttributes.lineHeight),
          imageAlign: image ? toImageAlign(image.attrs.align) : undefined,
          bold: current.isActive("bold"),
          italic: current.isActive("italic"),
          strike: current.isActive("strike"),
          bullet: current.isActive("bulletList"),
          ordered: current.isActive("orderedList"),
          quote: current.isActive("blockquote"),
          code: current.isActive("code"),
          codeBlock: current.isActive("codeBlock"),
          link: current.isActive("link"),
          table: current.isActive("table"),
        },
        link: (current.getAttributes("link").href as string | undefined) ?? "",
      };
    },
  });

  // 붙여넣거나 끌어다 놓은 이미지도 같은 업로드를 거친다(설계 문서 4절).
  function insertFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (!allowImages || images.length === 0) return false;
    void uploadAndInsert(images);
    return true;
  }

  // 여러 장은 한 장씩 차례로 올리고, 올라간 순서대로 커서 자리에 넣는다. 오류는 묶음을 시작할 때 한 번 지운다.
  async function uploadAndInsert(files: File[]) {
    imageUpload.clearError();
    for (const file of files) {
      const uploaded = await imageUpload.upload(file);
      if (!uploaded) continue;
      const { url } = uploaded;
      const alt = file.name.replace(/\.[^.]+$/, "");
      // 넣은 뒤 이미지 아래 새 줄로 커서를 옮겨, 이어서 쓰는 글이 이미지를 덮어쓰지 않게 한다.
      if (mode === "edit") editor?.chain().focus().setImage({ src: url, alt }).createParagraphNear().run();
      else editTextarea((edit) => replaceRange(edit, edit.selectionEnd, edit.selectionEnd, `\n![${alt}](${url})\n`));
    }
  }

  function editTextarea(change: (edit: TextEdit) => TextEdit) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // value(props)가 아니라 textarea의 지금 값을 쓴다. 이미지를 여러 장 차례로 넣을 때
    // 업로드를 기다리는 동안 props가 바뀌어도, 앞 장을 넣은 결과 위에 이어서 넣게 한다.
    const next = change({
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    });
    onChange(next.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  }

  function runAction(action: ToolbarAction) {
    if (mode === "markdown") return editTextarea((edit) => applyMarkdownAction(edit, action));
    const chain = blockChain();
    if (!chain) return;
    const commands: Record<ToolbarAction, () => void> = {
      bold: () => chain.toggleBold().run(),
      italic: () => chain.toggleItalic().run(),
      strike: () => chain.toggleStrike().run(),
      bullet: () => chain.toggleBulletList().run(),
      ordered: () => chain.toggleOrderedList().run(),
      quote: () => chain.toggleBlockquote().run(),
      table: () => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      code: () => chain.toggleCode().run(),
    };
    commands[action]();
  }

  /** 1~5: 제목, 0: 본문. 바꿔도 정렬·줄간격은 그대로 둔다. */
  function applyHeading(level: number) {
    if (mode === "markdown") return editTextarea((edit) => applyMarkdownHeading(edit, level));
    const chain = blockChain();
    if (!chain || !editor) return;
    const { align, lineHeight } = editor.getAttributes(editor.isActive("heading") ? "heading" : "paragraph");
    if (level) chain.setNode("heading", { level, align, lineHeight }).run();
    else chain.setNode("paragraph", { align, lineHeight }).run();
  }

  /** 드래그한 범위가 걸친 문단·제목 전체에 정렬이나 줄간격을 바꾼다. */
  function applyBlockStyle(change: Partial<TextBlockStyle>) {
    if (mode === "markdown") return editTextarea((edit) => applyMarkdownBlockStyle(edit, change));
    blockChain()?.updateAttributes("paragraph", change).updateAttributes("heading", change).run();
  }

  function applyImageAlign(align: ImageAlign) {
    editor?.chain().focus().updateAttributes("image", { align }).run();
  }

  function applyLink(href: string | null) {
    if (mode === "markdown") {
      return editTextarea((edit) => wrapSelection(edit, "[", `](${href ?? "https://"})`));
    }
    const chain = editor?.chain().focus().extendMarkRange("link");
    if (href) chain?.setLink({ href }).run();
    else chain?.unsetLink().run();
  }

  function insertCodeBlock(language: string) {
    rememberLanguage(language);
    if (mode === "markdown") return editTextarea((edit) => wrapSelection(edit, `\n\`\`\`${language}\n`, "\n```\n"));
    blockChain()?.toggleCodeBlock({ language }).run();
  }

  /** 이미지처럼 블록 전체가 선택돼 있으면 그 아래 빈 줄에서 명령을 실행한다(선택된 이미지가 바뀌거나 지워지지 않게). */
  function blockChain() {
    if (!editor) return null;
    const chain = editor.chain().focus();
    return editor.state.selection instanceof NodeSelection ? chain.createParagraphNear() : chain;
  }

  function handleSourceKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (mod && key === "b") {
      event.preventDefault();
      runAction("bold");
    } else if (mod && key === "i") {
      event.preventDefault();
      runAction("italic");
    } else if (mod && key === "k") {
      event.preventDefault();
      applyLink(null);
    } else if (mod && event.shiftKey && key === "c") {
      event.preventDefault();
      insertCodeBlock("java");
    } else if (event.key === "Tab" && !mod) {
      event.preventDefault();
      editTextarea((edit) => replaceRange(edit, edit.selectionStart, edit.selectionEnd, "  "));
    }
  }

  function switchMode(next: Mode) {
    if (next === mode) return;
    // 마크다운에서 고친 원문을 편집 화면에 다시 읽힌다. 반대 방향은 value가 이미 최신이다.
    if (next === "edit") editor?.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
    setMode(next);
  }

  useEffect(() => {
    latest.current = { onChange, insertFiles };
  });

  // 전체 화면에서는 Esc로 빠져나온다(메뉴가 열려 있지 않을 때).
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) setFullscreen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // 저장되는 마크다운 글자 수 (두 모드에서 같은 숫자)
  const characters = value.length;

  return (
    <div
      className={cn(
        "flex flex-col overflow-visible rounded-card border bg-background-01",
        invalid ? "border-danger" : "border-line-01",
        fullscreen && "fixed inset-4 z-50 overflow-hidden shadow-modal",
      )}
    >
      <div className="flex items-center gap-3 rounded-t-card border-b border-line-01 bg-background-02 px-5 py-1.5">
        <span className="text-label-m text-content-01">
          본문<span className="text-danger">*</span>
        </span>
        <div role="tablist" aria-label="편집 방식" className="flex rounded-full bg-background-04 p-1">
          {(["edit", "markdown"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => switchMode(item)}
              className={cn(
                "h-10 rounded-pill px-3.5 text-label-m transition-colors",
                mode === item ? "bg-background-01 text-content-01" : "text-content-02",
              )}
            >
              {item === "edit" ? "편집" : "마크다운"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ShortcutsButton />
          <button
            type="button"
            onClick={() => setFullscreen((value) => !value)}
            aria-pressed={fullscreen}
            title={fullscreen ? "전체 화면 닫기 (Esc)" : "전체 화면"}
            aria-label={fullscreen ? "전체 화면 닫기" : "전체 화면"}
            className="flex size-8 items-center justify-center rounded-lg text-content-02 hover:bg-background-04"
          >
            <Icon name="maximize" size={18} />
          </button>
        </div>
      </div>

      <EditorToolbar
        active={state?.active ?? {}}
        onAction={runAction}
        onHeading={applyHeading}
        onAlign={(align: TextAlign) => applyBlockStyle({ align })}
        onLineHeight={(lineHeight: LineHeight) => applyBlockStyle({ lineHeight })}
        onImageAlign={applyImageAlign}
        onLink={applyLink}
        currentLink={state?.link}
        onCodeBlock={insertCodeBlock}
        onImage={allowImages ? () => fileInputRef.current?.click() : undefined}
        linkOpen={linkOpen}
        onLinkOpenChange={setLinkOpen}
      />

      <div className={cn("min-h-0 flex-1 overflow-auto", fullscreen && "bg-background-01")}>
        {mode === "edit" ? (
          <EditorContent editor={editor} />
        ) : (
          <MarkdownSource
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleSourceKeyDown}
            invalid={invalid}
          />
        )}
      </div>

      {(imageUpload.error || imageUpload.uploading) && (
        <div className="px-5 pb-3">
          {imageUpload.error ? (
            <AlertDanger>{imageUpload.error}</AlertDanger>
          ) : (
            <p role="status" className="text-caption text-content-03">
              이미지를 올리는 중이에요…
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-b-card border-t border-line-01 bg-background-04 px-4 py-2 text-[12px] leading-[18px] text-content-03">
        <span className="tabular-nums">{characters.toLocaleString("ko-KR")}자</span>
        <span>{mode === "edit" ? EDIT_HINT : MARKDOWN_HINT}</span>
      </div>

      {allowImages && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length) void uploadAndInsert(files);
          }}
        />
      )}
    </div>
  );
}

/** 키보드 아이콘: 단축키 목록 (Figma 개발 메모 · 에디터 단축키. 표기는 Ctrl, 동작은 Ctrl·⌘ 모두) */
function ShortcutsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="단축키"
        title="단축키"
        className="flex size-8 items-center justify-center rounded-lg text-content-02 hover:bg-background-04"
      >
        <Icon name="keyboard" size={18} />
      </button>
      {open && (
        <dl className="absolute top-full right-0 z-30 mt-1 grid w-64 grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-line-01 bg-content-inverse p-4 shadow-panel">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys} className="contents">
              <dt className="font-mono text-mono-m text-content-01">{keys}</dt>
              <dd className="text-body-m text-content-02">{label}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

"use client";

import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { useRef, useState } from "react";
import { useDismiss } from "@/shared/hooks";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/utils";
import { languageLabel, rememberLanguage } from "./languages";
import { LanguageMenu } from "./language-menu";

// Figma Components › Editor / Code Block. 위 띠에 언어 칩, 왼쪽 줄 번호.
// 하이라이트는 lowlight 결과를 공개 화면과 같은 규칙(code-tokens.ts)으로 code-* 클래스로 바꿔 붙이고, 색은 prose.css가 칠한다.
export function CodeBlockView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuRef, menuOpen, () => setMenuOpen(false));
  const lineCount = Math.max(1, node.textContent.split("\n").length);
  const language = node.attrs.language as string | null;

  return (
    <NodeViewWrapper
      className={cn(
        "group my-5 overflow-visible rounded-xl border-2 bg-content-01",
        selected ? "border-primary" : "border-transparent focus-within:border-primary",
      )}
    >
      <div contentEditable={false} className="flex items-center gap-3 rounded-t-[10px] bg-(--color-ink-800) px-3 py-2">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="flex items-center gap-1 rounded-md bg-(--color-ink-600) py-1 pr-2 pl-2.5 font-mono text-[12px] leading-4 text-code-text"
          >
            {languageLabel(language)}
            <Icon name="chevron-down" size={12} />
          </button>
          {menuOpen && (
            <LanguageMenu
              value={language}
              onSelect={(value) => {
                rememberLanguage(value);
                updateAttributes({ language: value });
                setMenuOpen(false);
              }}
              onClose={() => setMenuOpen(false)}
              className="absolute top-full left-0 z-20 mt-1"
            />
          )}
        </div>
        <span className="ml-auto hidden text-[12px] leading-[18px] text-code-comment group-focus-within:inline">
          Tab 들여쓰기 · Shift+Enter 블록 밖으로
        </span>
      </div>
      {/* 줄 번호와 코드는 같은 글자 크기·줄 높이(14/18, Figma Editor / Code Block)여야 마지막 줄까지 맞는다. */}
      <div className="flex gap-4 overflow-x-auto py-4 pr-5 pl-4 font-mono text-[14px] leading-[18px]">
        <span contentEditable={false} aria-hidden className="flex flex-col text-right text-code-comment select-none">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </span>
        {/* 공개 화면용 .prose pre 스타일(여백·바탕)을 덮어쓴다. */}
        <pre className="m-0! min-w-0 flex-1 rounded-none! bg-transparent! p-0! font-mono text-[14px]! leading-[18px]! whitespace-pre text-code-text">
          <NodeViewContent<"code"> as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

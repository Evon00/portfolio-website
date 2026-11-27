"use client";

import type { KeyboardEvent, Ref } from "react";

// Figma Markdown Editor (Mode=Markdown). 같은 마크다운 문자열을 원문으로 고친다. 왼쪽 줄 번호.
type MarkdownSourceProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  ref?: Ref<HTMLTextAreaElement>;
  invalid?: boolean;
};

export function MarkdownSource(props: MarkdownSourceProps) {
  const { value, onChange, onKeyDown, ref, invalid } = props;
  const lineCount = Math.max(18, value.split("\n").length);
  return (
    <div className="flex min-h-[460px] font-mono text-mono-l">
      <span
        aria-hidden
        className="w-8 shrink-0 border-r border-line-01 bg-background-02 py-[18px] pr-1.5 text-right whitespace-pre text-content-04 select-none"
      >
        {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
      </span>
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        aria-label="본문 마크다운"
        aria-invalid={invalid || undefined}
        className="min-h-full flex-1 resize-none overflow-hidden bg-transparent px-3 py-[18px] whitespace-pre text-content-01 outline-none [field-sizing:content]"
      />
    </div>
  );
}

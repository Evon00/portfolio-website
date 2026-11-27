import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_TEXT_ALIGN,
  parseDirectiveAttributes,
  type TextBlockStyle,
  toLineHeight,
  toTextAlign,
  wrapTextBlock,
} from "@/shared/libs/markdown/block-style";

// 툴바 동작 하나를 편집 모드(Tiptap 명령)와 마크다운 모드(원문 문자열 고치기)에서 똑같이 쓴다.
export type ToolbarAction = "bold" | "italic" | "strike" | "bullet" | "ordered" | "quote" | "table" | "code";

export type TextEdit = { value: string; selectionStart: number; selectionEnd: number };

const WRAP: Partial<Record<ToolbarAction, string>> = { bold: "**", italic: "*", strike: "~~", code: "`" };
const LINE_PREFIX: Partial<Record<ToolbarAction, string>> = {
  bullet: "- ",
  ordered: "1. ",
  quote: "> ",
};
const TABLE_TEMPLATE = "\n| 제목 | 제목 |\n| --- | --- |\n| 내용 | 내용 |\n";

/** 마크다운 원문에서 선택 영역을 감싸거나, 줄 앞에 기호를 붙이거나, 내용을 끼워 넣는다. */
export function applyMarkdownAction(edit: TextEdit, action: ToolbarAction): TextEdit {
  const wrap = WRAP[action];
  if (wrap) return wrapSelection(edit, wrap, wrap);
  const prefix = LINE_PREFIX[action];
  if (prefix) {
    const lineStart = edit.value.lastIndexOf("\n", edit.selectionStart - 1) + 1;
    return replaceRange(edit, lineStart, lineStart, prefix);
  }
  return replaceRange(edit, edit.selectionEnd, edit.selectionEnd, TABLE_TEMPLATE);
}

export function wrapSelection(edit: TextEdit, before: string, after: string): TextEdit {
  const { value, selectionStart, selectionEnd } = edit;
  const selected = value.slice(selectionStart, selectionEnd);
  return {
    value: value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd),
    selectionStart: selectionStart + before.length,
    selectionEnd: selectionEnd + before.length,
  };
}

export function replaceRange(edit: TextEdit, start: number, end: number, text: string): TextEdit {
  const delta = text.length - (end - start);
  // 바뀐 범위 뒤의 커서는 늘어난 만큼 밀고, 범위 안의 커서는 끼워 넣은 글 끝으로 옮긴다.
  const shift = (position: number) =>
    position >= end ? position + delta : position >= start ? start + text.length : position;
  return {
    value: edit.value.slice(0, start) + text + edit.value.slice(end),
    selectionStart: shift(edit.selectionStart),
    selectionEnd: shift(edit.selectionEnd),
  };
}

/** 커서가 있는 줄을 제목(1~5)으로, 0이면 본문으로 바꾼다. 이미 붙은 # 기호는 바꿔 끼운다. */
export function applyMarkdownHeading(edit: TextEdit, level: number): TextEdit {
  const lineStart = edit.value.lastIndexOf("\n", edit.selectionStart - 1) + 1;
  const existing = /^#{1,6}[ \t]+/.exec(edit.value.slice(lineStart))?.[0] ?? "";
  return replaceRange(edit, lineStart, lineStart + existing.length, level ? `${"#".repeat(level)} ` : "");
}

const OPEN_P = /^:::p(?:\{([^}]*)\})?[ \t]*$/;
const SKIP_BLOCK = /^(```|:::|\||>|!\[|[-*+] |\d+\. )/;

/**
 * 선택 범위가 걸친 문단(빈 줄로 나뉜 덩어리)마다 :::p{…} 표시를 붙이거나 고친다. 기본값만 남으면 표시를 뗀다.
 * 코드 블록·목록·인용·표·이미지 덩어리는 건드리지 않는다.
 */
export function applyMarkdownBlockStyle(edit: TextEdit, change: Partial<TextBlockStyle>): TextEdit {
  const lines = edit.value.split("\n");
  const starts: number[] = [];
  lines.reduce((offset, line) => (starts.push(offset), offset + line.length + 1), 0);
  const lineAt = (position: number) =>
    Math.max(
      0,
      starts.findLastIndex((start) => start <= position),
    );

  // 빈 줄로 나뉜 덩어리 [첫 줄, 끝 줄]
  const blocks: [number, number][] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]!.trim()) continue;
    const first = i;
    while (i + 1 < lines.length && lines[i + 1]!.trim()) i++;
    blocks.push([first, i]);
  }
  const from = lineAt(edit.selectionStart);
  const to = lineAt(edit.selectionEnd);
  let next = edit;
  for (const [first, last] of blocks.filter(([a, b]) => b >= from && a <= to).reverse()) {
    const open = OPEN_P.exec(lines[first]!);
    const wrapped = open && last > first + 1 && lines[last]!.trim() === ":::";
    const inner = wrapped ? lines.slice(first + 1, last) : lines.slice(first, last + 1);
    if (!wrapped && SKIP_BLOCK.test(inner[0]!)) continue;
    const current = parseDirectiveAttributes(open?.[1] ?? "");
    const style: TextBlockStyle = {
      align: change.align ?? (wrapped ? toTextAlign(current.align) : DEFAULT_TEXT_ALIGN),
      lineHeight: change.lineHeight ?? (wrapped ? toLineHeight(current.lh) : DEFAULT_LINE_HEIGHT),
    };
    const start = starts[first]!;
    const end = starts[last]! + lines[last]!.length;
    next = replaceRange(next, start, end, wrapTextBlock(inner.join("\n"), style));
  }
  return next;
}

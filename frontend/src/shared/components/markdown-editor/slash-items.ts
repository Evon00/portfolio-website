import type { Editor } from "@tiptap/core";
import type { IconName } from "@/shared/components/icon";
import { HEADING_LEVELS, type HeadingLevel } from "./block-style-extensions";

// Figma Components › Editor / Slash Menu. 오른쪽은 같은 결과를 내는 마크다운 단축 입력.
export type SlashItem = {
  id: string;
  label: string;
  shortcut: string;
  icon: IconName | `H${HeadingLevel}` | "—";
  keywords: string[];
  run: (editor: Editor) => void;
};

export function createSlashItems({ onRequestImage }: { onRequestImage?: () => void }): SlashItem[] {
  const items: SlashItem[] = [
    ...HEADING_LEVELS.map((level) => ({
      id: `h${level}`,
      label: `제목 ${level}`,
      shortcut: "#".repeat(level),
      icon: `H${level}` as const,
      keywords: ["heading", "제목", `h${level}`],
      run: (editor: Editor) => editor.chain().focus().setHeading({ level }).run(),
    })),
    {
      id: "bullet",
      label: "목록",
      shortcut: "-",
      icon: "list",
      keywords: ["list", "목록", "bullet"],
      run: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ordered",
      label: "번호 목록",
      shortcut: "1.",
      icon: "list-ordered",
      keywords: ["ordered", "번호", "number"],
      run: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "quote",
      label: "인용",
      shortcut: ">",
      icon: "quote",
      keywords: ["quote", "인용", "강조"],
      run: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      id: "code",
      label: "코드 블록",
      shortcut: "```",
      icon: "code-block",
      keywords: ["code", "코드"],
      run: (editor) => editor.chain().focus().toggleCodeBlock({ language: "java" }).run(),
    },
    {
      id: "image",
      label: "이미지",
      shortcut: "",
      icon: "image",
      keywords: ["image", "이미지", "사진"],
      run: () => onRequestImage?.(),
    },
    {
      id: "table",
      label: "표",
      shortcut: "",
      icon: "table",
      keywords: ["table", "표"],
      run: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: "divider",
      label: "구분선",
      shortcut: "---",
      icon: "—",
      keywords: ["divider", "구분선", "hr"],
      run: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
  ];
  // 프로젝트 본문은 이미지를 갤러리에서만 관리한다(Figma Markdown Editor 설명).
  return onRequestImage ? items : items.filter((item) => item.id !== "image");
}

export function filterSlashItems(items: SlashItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.label.includes(q) || item.keywords.some((keyword) => keyword.includes(q)));
}

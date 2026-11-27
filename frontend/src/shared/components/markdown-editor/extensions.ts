import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  blockStyleExtensions,
  imageAlignConfig,
  renderImageMarkdown,
  StyledHeading,
  StyledParagraph,
} from "./block-style-extensions";
import { CodeBlockView } from "./code-block-view";
import { lowlight } from "./code-highlight";
import { ImageBlockView } from "./image-block-view";
import { createSlashCommand } from "./slash-command";
import { createSlashItems } from "./slash-items";

// 에디터 확장 묶음 (설계 문서 9절). 저장 형식은 마크다운 문자열이다.
// 문단·제목 정렬과 줄간격, 이미지 정렬은 :::p · :::image 표시로 저장한다(block-style-extensions.ts).
// 하지 않는 것: 밑줄, 이미지 크기, 인용 색.
// 하이라이트는 lowlight(code-highlight.ts). 언어 칩·줄 번호 NodeView는 그대로 쓴다.
const EditorCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Figma 표기: Ctrl+Shift+C 코드 블록 (Mac은 ⌘도 같이 동작)
      "Mod-Shift-c": () => this.editor.commands.toggleCodeBlock({ language: "java" }),
      // 코드 블록 밖으로: 바로 아래가 빈 문단이면 그 줄로 옮기고, 아니면 새 문단을 만든다(빈 줄이 겹겹이 생기지 않게).
      "Shift-Enter": () => {
        if (!this.editor.isActive(this.name)) return false;
        const { $from } = this.editor.state.selection;
        const after = $from.after($from.depth);
        const next = this.editor.state.doc.nodeAt(after);
        if (next?.type.name === "paragraph" && next.content.size === 0) {
          return this.editor.commands.setTextSelection(after + 1);
        }
        return this.editor.commands.exitCode();
      },
    };
  },
  // 언어 없는 펜스(```)는 공개 화면처럼 일반 텍스트로 칠한다. 새 블록은 툴바·/ 메뉴·단축키가 java를 넘긴다.
}).configure({ lowlight, enableTabIndentation: true, tabSize: 4, defaultLanguage: "text" });

const EditorImage = Image.extend({
  ...imageAlignConfig,
  renderMarkdown(node, helpers, ctx) {
    return renderImageMarkdown(this.parent?.(node, helpers, ctx) ?? "", node, ctx);
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
}).configure({ inline: false, allowBase64: false });

export function createExtensions({ onRequestImage }: { onRequestImage?: () => void }) {
  return [
    StarterKit.configure({
      paragraph: false,
      heading: false,
      codeBlock: false,
      underline: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
    }),
    StyledParagraph,
    StyledHeading,
    ...blockStyleExtensions,
    EditorCodeBlock,
    ...(onRequestImage ? [EditorImage] : []),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    // 빈 줄 안내는 빈 문단에만 보인다. 빈 코드 블록·제목 위에 겹쳐 그려지지 않게 한다.
    Placeholder.configure({
      placeholder: ({ node }) =>
        node.type.name === "paragraph" ? "/ 를 입력해 블록을 추가하거나, 그냥 이어서 써요" : "",
    }),
    Markdown,
    createSlashCommand(createSlashItems({ onRequestImage })),
  ];
}

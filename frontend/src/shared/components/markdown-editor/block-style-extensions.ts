import { Extension, mergeAttributes } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import type { JSONContent, MarkdownToken, RenderContext } from "@tiptap/core";
import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_TEXT_ALIGN,
  parseDirectiveAttributes,
  textBlockClasses,
  toImageAlign,
  toLineHeight,
  toTextAlign,
  wrapImage,
  wrapTextBlock,
} from "@/shared/libs/markdown/block-style";

// 문단·제목의 정렬(align)·줄간격(lineHeight)과 이미지 정렬(align)을 에디터에서 다루고
// 마크다운의 :::p · :::image 표시로 읽고 쓴다. 문법과 허용 목록은 shared/libs/markdown/block-style.ts.
// 표시는 본문 맨 위 블록에만 붙인다(목록·인용·표 안의 문단은 정렬·줄간격 없이 저장한다).

export const HEADING_LEVELS = [1, 2, 3, 4, 5] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

const isTopLevel = (ctx?: RenderContext) => !ctx?.parentType || ctx.parentType === "doc";

/** 문단·제목 공통: align · lineHeight 속성과 md-align-* · md-lh-* 클래스 */
const TextBlockStyle = Extension.create({
  name: "textBlockStyle",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          align: {
            default: DEFAULT_TEXT_ALIGN,
            parseHTML: () => DEFAULT_TEXT_ALIGN,
            renderHTML: (attributes) => {
              const [className] = textBlockClasses({ align: toTextAlign(attributes.align), lineHeight: "normal" });
              return className ? { class: className } : {};
            },
          },
          lineHeight: {
            default: DEFAULT_LINE_HEIGHT,
            parseHTML: () => DEFAULT_LINE_HEIGHT,
            renderHTML: (attributes) => {
              const [className] = textBlockClasses({ align: "left", lineHeight: toLineHeight(attributes.lineHeight) });
              return className ? { class: className } : {};
            },
          },
        },
      },
    ];
  },
});

function wrapStyled(node: JSONContent, markdown: string, ctx?: RenderContext) {
  if (!isTopLevel(ctx) || !markdown.trim() || markdown.trim() === "&nbsp;") return markdown;
  return wrapTextBlock(markdown, {
    align: toTextAlign(node.attrs?.align),
    lineHeight: toLineHeight(node.attrs?.lineHeight),
  });
}

export const StyledParagraph = Paragraph.extend({
  renderMarkdown(node, helpers, ctx) {
    return wrapStyled(node, this.parent?.(node, helpers, ctx) ?? "", ctx);
  },
});

// 제목 1~5. 화면 크기는 md-h1 ~ md-h5 클래스로 정한다(prose.css, 공개 화면과 같은 기준).
export const StyledHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = HEADING_LEVELS.includes(node.attrs.level) ? (node.attrs.level as HeadingLevel) : 1;
    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: `md-h${level}` }), 0];
  },
  renderMarkdown(node, helpers, ctx) {
    return wrapStyled(node, this.parent?.(node, helpers, ctx) ?? "", ctx);
  },
}).configure({ levels: [...HEADING_LEVELS] });

/** 이미지에 align 속성을 더하고 :::image{align}로 저장한다. Image 확장에 .extend로 붙인다. */
export const imageAlignConfig = {
  addAttributes(this: { parent?: () => Record<string, unknown> }) {
    return {
      ...this.parent?.(),
      align: {
        default: toImageAlign(undefined),
        parseHTML: (element: HTMLElement) => toImageAlign(element.dataset.align),
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-align": toImageAlign(attributes.align) }),
      },
    };
  },
};

export function renderImageMarkdown(markdown: string, node: JSONContent, ctx?: RenderContext) {
  return isTopLevel(ctx) ? wrapImage(markdown, toImageAlign(node.attrs?.align)) : markdown;
}

type DirectiveToken = MarkdownToken & { name: "p" | "image"; attributes: Record<string, string> };

const DIRECTIVE = /^:::(p|image)(?:\{([^}\n]*)\})?[ \t]*\n([\s\S]*?)\n:::[ \t]*(?:\n+|$)/;

/** :::p{…} / :::image{…} 블록을 읽어, 안의 문단·제목·이미지에 속성을 붙인다. */
const BlockStyleDirective = Extension.create({
  name: "blockStyleDirective",
  markdownTokenName: "blockStyleDirective",
  markdownTokenizer: {
    name: "blockStyleDirective",
    level: "block",
    start: (src) => src.search(/^:::(?:p|image)\b/m),
    tokenize(src, _tokens, lexer) {
      const match = DIRECTIVE.exec(src);
      if (!match) return undefined;
      return {
        type: "blockStyleDirective",
        raw: match[0],
        name: match[1] as DirectiveToken["name"],
        attributes: parseDirectiveAttributes(match[2] ?? ""),
        tokens: lexer.blockTokens(match[3] ?? ""),
      } satisfies DirectiveToken;
    },
  },
  parseMarkdown(token, helpers) {
    const { name, attributes } = token as DirectiveToken;
    const children = helpers.parseChildren(token.tokens ?? []);
    const apply = (node: JSONContent): JSONContent => {
      if (name === "p" && (node.type === "paragraph" || node.type === "heading")) {
        return {
          ...node,
          attrs: { ...node.attrs, align: toTextAlign(attributes.align), lineHeight: toLineHeight(attributes.lh) },
        };
      }
      if (name === "image" && node.type === "image") {
        return { ...node, attrs: { ...node.attrs, align: toImageAlign(attributes.align) } };
      }
      return node.content ? { ...node, content: node.content.map(apply) } : node;
    };
    return children.map(apply);
  },
});

export const blockStyleExtensions = [TextBlockStyle, BlockStyleDirective];

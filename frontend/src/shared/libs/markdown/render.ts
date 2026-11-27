import "server-only";

import type { Element, ElementContent, Root } from "hast";
import type { Root as MdastRoot, RootContent } from "mdast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { VFile } from "vfile";
import { unified } from "unified";
import { EXIT, SKIP, visit } from "unist-util-visit";
import { imageClass, textBlockClasses, toImageAlign, toLineHeight, toTextAlign } from "./block-style";
import { CODE_TOKEN_BY_MARKER, codeTheme } from "./code-theme";
import { type CodeSegment, codeTokenClass, refineCodeTokens } from "./code-tokens";

// 공개 페이지와 어드민 미리보기가 함께 쓰는 마크다운 → HTML 렌더러(설계 문서 10절).
// 서버에서만 돌고 브라우저에는 결과 HTML만 간다. 원시 HTML과 style 속성은 허용하지 않는다(remark-rehype 기본값).
// 정렬·줄간격·이미지 정렬은 :::p · :::image 표시(block-style.ts)를 정해 둔 클래스로만 바꾼다.

type RenderOptions = {
  /** 본문 맨 앞이 이미지면 지운다. 상세 상단 커버로 같은 이미지를 이미 보여 줄 때 쓴다. */
  omitLeadingImage?: boolean;
};

const IMAGE_CLASS = "data-image-class";

// :::p{align lh} → 안의 문단·제목에 md-align-* · md-lh-* 클래스, :::image{align} → 이미지 figure에 md-image-*.
// 표시는 벗겨 내고 안의 블록만 남긴다. 그 밖의 지시문(:abc, ::abc, :::abc)은 쓴 글자 그대로 되돌린다
// (예: "예:abc"가 지시문으로 읽혀 사라지지 않게).
function remarkBlockStyle() {
  return (tree: MdastRoot, file: VFile) => {
    const source = String(file.value);
    const literal = (node: RootContent) =>
      source.slice(node.position?.start.offset ?? 0, node.position?.end.offset ?? 0);

    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.type === "textDirective") {
        parent.children.splice(index, 1, { type: "text", value: literal(node) } as never);
        return SKIP;
      }
      if (node.type === "leafDirective") {
        parent.children.splice(index, 1, {
          type: "paragraph",
          children: [{ type: "text", value: literal(node) }],
        } as never);
        return SKIP;
      }
      if (node.type !== "containerDirective") return;

      // :::p[라벨]처럼 붙인 라벨은 쓰지 않는다.
      const children = node.children.filter(
        (child) => !(child.type === "paragraph" && child.data && "directiveLabel" in child.data),
      );
      const attributes = node.attributes ?? {};
      for (const child of children) {
        if (node.name === "p" && (child.type === "paragraph" || child.type === "heading")) {
          const classes = textBlockClasses({
            align: toTextAlign(attributes.align),
            lineHeight: toLineHeight(attributes.lh),
          });
          if (classes.length) child.data = { ...child.data, hProperties: { className: classes } };
        }
        if (node.name === "image" && child.type === "paragraph") {
          child.data = {
            ...child.data,
            hProperties: { [IMAGE_CLASS]: imageClass(toImageAlign(attributes.align)) },
          };
        }
      }
      parent.children.splice(index, 1, ...children);
      return index;
    });
  };
}

const isWhitespace = (node: ElementContent) => node.type === "text" && node.value.trim() === "";

// 이미지만 있는 문단 → <figure class="md-image-*"><img><figcaption>설명</figcaption></figure>
// 설명은 마크다운 title 자리(![대체텍스트](주소 "설명"))에 둔다. 에디터도 같은 규칙으로 읽고 쓴다.
// 정렬 표시가 없으면 전체 폭(md-image-full)이다.
function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "p" || index === undefined || !parent) return;
      const content = node.children.filter((child) => !isWhitespace(child));
      const [image] = content;
      if (content.length !== 1 || image?.type !== "element" || image.tagName !== "img") return;

      const caption = typeof image.properties.title === "string" ? image.properties.title : "";
      const img: Element = {
        ...image,
        properties: { ...image.properties, title: undefined, loading: "lazy", decoding: "async" },
      };
      const marked = node.properties[IMAGE_CLASS];
      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: { className: [typeof marked === "string" ? marked : imageClass(toImageAlign(undefined))] },
        children: caption
          ? [
              img,
              { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: caption }] },
            ]
          : [img],
      };
      parent.children[index] = figure;
    });
  };
}

// 본문 이미지는 lazy로 받되, 첫 화면에 보일 수 있는 첫 본문 이미지(표지로 뺀 이미지 다음)만 바로 받는다.
function rehypeEagerFirstImage() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      if (node.properties.loading === "lazy") node.properties.loading = "eager";
      return EXIT;
    });
  };
}

// 공개 페이지는 글 제목이 h1이므로 본문 제목(# ~ #####)을 한 단계씩 낮춰 h2 ~ h6으로 낸다.
// 크기는 마크다운 단계(md-h1 ~ md-h5)로 정한다(prose.css). 에디터도 같은 클래스를 붙인다.
function rehypeShiftHeadings() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      const match = /^h([1-6])$/.exec(node.tagName);
      if (!match) return;
      const level = Number(match[1]);
      const className = Array.isArray(node.properties.className) ? node.properties.className : [];
      node.tagName = `h${Math.min(level + 1, 6)}`;
      node.properties.className = [`md-h${Math.min(level, 5)}`, ...className];
    });
  };
}

// rehype-pretty-code(shiki)가 표시 색으로 칠한 줄을 에디터와 같은 보정 규칙(code-tokens.ts)을 거쳐
// <span class="code-…">로 바꾼다. 색은 prose.css가 칠하므로 코드에는 style 속성이 남지 않는다.
function rehypeCodeTokens() {
  return (tree: Root) => {
    visit(tree, "element", (code) => {
      // rehype-pretty-code는 속성 이름을 data-language · data-line 그대로 둔다.
      const language = code.properties["data-language"] ?? code.properties.dataLanguage;
      if (code.tagName !== "code" || typeof language !== "string") return;
      for (const line of code.children) {
        if (line.type !== "element" || (line.properties["data-line"] ?? line.properties.dataLine) === undefined)
          continue;
        const segments: CodeSegment[] = line.children.flatMap((child): CodeSegment[] => {
          if (child.type === "text") return [{ text: child.value, token: "text" }];
          if (child.type !== "element") return [];
          const color = /color:\s*(#[0-9a-f]+)/i.exec(String(child.properties.style ?? ""))?.[1]?.toLowerCase();
          const text = child.children.map((part) => (part.type === "text" ? part.value : "")).join("");
          return [{ text, token: (color && CODE_TOKEN_BY_MARKER.get(color)) || "text" }];
        });
        line.children = refineCodeTokens(language, segments).map(({ text, token }) => ({
          type: "element",
          tagName: "span",
          properties: { className: [codeTokenClass(token)] },
          children: [{ type: "text", value: text }],
        }));
      }
    });
  };
}

// unified는 옵션 true를 "옵션 없음"으로 넘기므로 객체로 받는다.
function rehypeOmitLeadingImage({ enabled }: { enabled: boolean }) {
  return (tree: Root) => {
    if (!enabled) return;
    const firstIndex = tree.children.findIndex((child) => child.type === "element");
    const first = tree.children[firstIndex];
    if (first?.type === "element" && first.tagName === "figure") tree.children.splice(firstIndex, 1);
  };
}

export async function renderMarkdown(markdown: string, options: RenderOptions = {}) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkBlockStyle)
    .use(remarkRehype)
    .use(rehypeFigure)
    .use(rehypeShiftHeadings)
    .use(rehypeOmitLeadingImage, { enabled: options.omitLeadingImage ?? false })
    .use(rehypeEagerFirstImage)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["heading-anchor"] } })
    .use(rehypePrettyCode, { theme: codeTheme, keepBackground: false, defaultLang: "plaintext" })
    .use(rehypeCodeTokens)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

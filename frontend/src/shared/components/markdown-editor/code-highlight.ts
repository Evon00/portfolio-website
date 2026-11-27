import type { Element, ElementContent, Root } from "hast";
import bash from "highlight.js/lib/languages/bash";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import kotlin from "highlight.js/lib/languages/kotlin";
import plaintext from "highlight.js/lib/languages/plaintext";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";
import { createLowlight } from "lowlight";
import {
  type CodeSegment,
  type CodeToken,
  codeTokenClass,
  hljsToken,
  refineCodeTokens,
} from "@/shared/libs/markdown/code-tokens";

// 에디터 안 코드 블록 하이라이트(lowlight = highlight.js). 언어 메뉴(languages.ts)에 있는 것만 등록한다.
// 펜스 이름(js · ts · text)은 별칭으로 잇고, 등록되지 않은 이름은 자동 감지하지 않고 일반 텍스트로 본다.
// lowlight 결과를 공개 화면(shiki)과 같은 분류·보정 규칙(code-tokens.ts)으로 옮겨 <span class="code-…">로 낸다.
const base = createLowlight({ bash, java, javascript, json, kotlin, plaintext, sql, typescript, yaml });
base.registerAlias({ javascript: ["js"], typescript: ["ts"], plaintext: ["text"] });

function toSegments(nodes: ElementContent[], inherited: CodeToken): CodeSegment[] {
  return nodes.flatMap((node): CodeSegment[] => {
    if (node.type === "text") return [{ text: node.value, token: inherited }];
    if (node.type !== "element") return [];
    const classNames = Array.isArray(node.properties.className) ? node.properties.className.map(String) : [];
    return toSegments(node.children, hljsToken(classNames) ?? inherited);
  });
}

function highlight(language: string, code: string): Root {
  const name = base.registered(language) ? language : "plaintext";
  const tree = base.highlight(name, code);
  // 보정 규칙은 공개 화면처럼 펜스 이름(js · ts …)으로 고른다.
  const segments = refineCodeTokens(language, toSegments(tree.children as ElementContent[], "text"));
  return {
    type: "root",
    children: segments.map(({ text, token }): Element => ({
      type: "element",
      tagName: "span",
      properties: { className: [codeTokenClass(token)] },
      children: [{ type: "text", value: text }],
    })),
  };
}

/** CodeBlockLowlight에 넘기는 lowlight 모양(highlight · highlightAuto · listLanguages · registered) */
export const lowlight = {
  highlight,
  highlightAuto: (code: string) => highlight("plaintext", code),
  listLanguages: () => base.listLanguages(),
  registered: (language: string) => base.registered(language),
};

// 코드 하이라이트 분류 한 곳. 공개 화면(shiki, render.ts)과 에디터(lowlight, code-highlight.ts)가 같이 쓴다.
// 두 하이라이터는 낱말을 나누는 방식이 달라, 각자 결과를 아래 일곱 분류로 옮긴 뒤 같은 보정 규칙(refineCodeTokens)을
// 거쳐 <span class="code-…">로 낸다. 색은 prose.css의 .code-* 규칙이 Figma code/* 토큰으로 칠한다.
// code/text(기본·구두점·연산자) · code/keyword(예약어) · code/type(타입·클래스·어노테이션) · code/function(함수 선언·호출)
// code/string(문자열) · code/number(숫자) · code/comment(주석)
export type CodeToken = "text" | "comment" | "keyword" | "type" | "function" | "string" | "number";

export type CodeSegment = { text: string; token: CodeToken };

/** shiki 테마용: 분류마다 TextMate 스코프. 테마 색 자리에 분류 이름을 넣고 render.ts가 클래스로 바꾼다. */
export const SHIKI_SCOPES: Record<Exclude<CodeToken, "text">, string[]> & { text: string[] } = {
  // 연산자·구두점, JSON·YAML 키, 화살표(=>), 셸 인자는 기본 글자색
  text: [
    "keyword.operator",
    "punctuation",
    "support.type.property-name",
    "entity.name.tag.yaml",
    "storage.type.function.arrow",
    "string.unquoted.argument",
  ],
  comment: ["comment", "punctuation.definition.comment"],
  keyword: [
    "keyword",
    "storage.modifier",
    "storage.type.primitive",
    "storage.type.function",
    "storage.type.class",
    "storage.type.ts",
    "storage.type.type.ts",
    "storage.type.js",
    "constant.language",
    "variable.language",
  ],
  type: [
    "storage.type",
    "entity.name.type",
    "entity.name.class",
    "entity.other.inherited-class",
    "support.class",
    "support.type",
    "entity.name.tag",
    "punctuation.definition.annotation",
  ],
  function: ["entity.name.function", "support.function"],
  string: [
    "string",
    "string.quoted",
    "string.template",
    "punctuation.definition.string",
    "punctuation.definition.template-expression",
  ],
  number: ["constant.numeric", "constant.character"],
};

/** lowlight(highlight.js) 클래스 → 분류. 더 구체적인 것(두 클래스)을 먼저 본다. */
const HLJS_RULES: [string[], CodeToken][] = [
  [["hljs-title", "class_"], "type"],
  [["hljs-title", "function_"], "function"],
  [["hljs-comment"], "comment"],
  [["hljs-quote"], "comment"],
  [["hljs-keyword"], "keyword"],
  [["hljs-literal"], "keyword"],
  [["hljs-type"], "type"],
  [["hljs-built_in"], "type"],
  [["hljs-meta"], "type"],
  [["hljs-title"], "function"],
  [["hljs-string"], "string"],
  [["hljs-regexp"], "string"],
  [["hljs-number"], "number"],
];

export function hljsToken(classNames: string[]): CodeToken | null {
  return HLJS_RULES.find(([names]) => names.every((name) => classNames.includes(name)))?.[1] ?? null;
}

const CODE_LANGUAGES = new Set(["java", "kotlin", "ts", "typescript", "js", "javascript"]);
const SQL_KEYWORDS = new Set(["true", "false", "null", "limit", "offset"]);
// 이름 · 공백 덩어리 · 그 밖의 한 글자(숫자·기호·한글 포함). 글자는 하나도 빠지지 않는다.
const WORD = /[A-Za-z_$][\w$]*|\s+|./g;

/**
 * 두 하이라이터의 차이를 같은 규칙으로 맞춘다(낱말 단위).
 * · 이름 뒤에 "("가 오면 함수 호출(function) — SQL은 COUNT( 같은 집계 함수도
 * · Java·Kotlin·TS·JS: 대문자로 시작하는 이름은 타입(type), 소문자인데 타입으로 칠해진 것(int 등 기본형)은 예약어
 * · SQL: TRUE · FALSE · NULL · LIMIT · OFFSET은 예약어
 * · Bash: 줄 맨 앞과 && · || · | · ; 뒤의 명령 이름은 함수(function)
 */
export function refineCodeTokens(language: string, segments: CodeSegment[]): CodeSegment[] {
  const words: CodeSegment[] = segments.flatMap(({ text, token }) =>
    (text.match(WORD) ?? []).map((part) => ({ text: part, token })),
  );
  const isCode = CODE_LANGUAGES.has(language);
  const isSql = language === "sql";
  const isShell = language === "bash" || language === "sh";
  let commandPosition = true;
  words.forEach((word, index) => {
    if (isShell) {
      const atCommand = commandPosition;
      if (word.text.includes("\n") || ["&", "|", ";"].includes(word.text)) commandPosition = true;
      else if (word.text.trim() && !["&", "|"].includes(word.text)) commandPosition = false;
      if (word.token === "comment" || word.token === "string" || !/^[A-Za-z_]/.test(word.text)) return;
      word.token = atCommand && !/=/.test(words[index + 1]?.text ?? "") ? "function" : "text";
      return;
    }
    if (!/^[A-Za-z_$]/.test(word.text) || word.token === "string" || word.token === "comment") return;
    // 같은 줄에서 다음 글자가 "("인지 본다(줄을 넘기면 보지 않는다. 공개 화면은 줄 단위로 칠한다).
    const next = words.slice(index + 1).find((after) => after.text.includes("\n") || after.text.trim());
    const called = (isCode || isSql) && next?.text === "(";
    if (called && (word.token === "text" || (isSql && word.token === "type"))) word.token = "function";
    if (isCode && /^[A-Z]/.test(word.text) && (word.token === "text" || word.token === "function")) word.token = "type";
    if (isCode && /^[a-z]/.test(word.text) && word.token === "type" && !called) word.token = "keyword";
    if (isSql && SQL_KEYWORDS.has(word.text.toLowerCase())) word.token = "keyword";
  });
  return words.reduce<CodeSegment[]>((merged, word) => {
    const last = merged.at(-1);
    const token = word.text.trim() ? word.token : (last?.token ?? word.token);
    if (last && last.token === token) last.text += word.text;
    else merged.push({ text: word.text, token });
    return merged;
  }, []);
}

export const codeTokenClass = (token: CodeToken) => `code-${token}`;

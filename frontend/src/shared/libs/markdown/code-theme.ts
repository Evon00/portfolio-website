import type { ThemeRegistrationRaw } from "shiki";
import { type CodeToken, SHIKI_SCOPES } from "./code-tokens";

// shiki 테마: 스코프를 code-tokens.ts의 분류로 나누고, 색 자리에 분류마다 표시용 색을 넣는다.
// 실제 색은 쓰지 않는다. render.ts가 이 표시 색을 code-* 클래스로 바꾸고 prose.css가 Figma code/* 토큰으로 칠한다.
const TOKENS = Object.keys(SHIKI_SCOPES) as CodeToken[];
const markerOf = (token: CodeToken) => `#c0de${TOKENS.indexOf(token).toString(16).padStart(2, "0")}`;

export const CODE_TOKEN_BY_MARKER = new Map(TOKENS.map((token) => [markerOf(token), token]));

const rules: ThemeRegistrationRaw["settings"] = [
  { settings: { foreground: markerOf("text") } },
  ...TOKENS.map((token) => ({ scope: SHIKI_SCOPES[token], settings: { foreground: markerOf(token) } })),
];

export const codeTheme: ThemeRegistrationRaw = {
  name: "portfolio-code",
  type: "dark",
  colors: { "editor.foreground": markerOf("text"), "editor.background": "transparent" },
  // rehype-pretty-code 타입은 settings를 요구하고, 실행 중에는 tokenColors가 있어야 테마 하나로 인식한다.
  settings: rules,
  tokenColors: rules,
};

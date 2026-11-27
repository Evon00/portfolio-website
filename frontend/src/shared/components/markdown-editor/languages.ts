// Figma Components › Editor / Code Language Menu. 펜스 이름(```java)과 화면 이름.
// 공개 페이지 하이라이트(shiki)가 아는 이름을 쓴다. 최근 사용 언어는 브라우저에 기억한다.
export const CODE_LANGUAGES = [
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" },
  { value: "text", label: "일반 텍스트" },
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["value"];

const RECENT_KEY = "editor:recent-languages";
const RECENT_LIMIT = 2;

export function languageLabel(value: string | null | undefined) {
  return CODE_LANGUAGES.find((language) => language.value === value)?.label ?? value ?? "일반 텍스트";
}

export function readRecentLanguages(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function rememberLanguage(value: string) {
  try {
    const next = [value, ...readRecentLanguages().filter((item) => item !== value)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // 저장소를 못 쓰면 기억하지 않는다.
  }
}

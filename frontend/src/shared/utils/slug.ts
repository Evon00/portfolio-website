// 슬러그 규칙: 영문 소문자·숫자·하이픈(설계 문서 2절).
// 한글 제목은 자동으로 만들 글자가 없으니 직접 입력한다.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
}

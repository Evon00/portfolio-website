// 문단·제목 정렬과 줄간격, 이미지 정렬을 마크다운에 저장하는 규칙(설계 문서 10절).
// 에디터(Tiptap, 브라우저)와 렌더러(remark, 서버)가 같은 허용 목록·클래스 이름을 쓴다.
//
//   :::p{align=center lh=relaxed}        :::image{align=left}
//   문단 또는 ## 제목 한 블록             ![대체텍스트](주소 "설명")
//   :::                                  :::
//
// 기본값만 있는 블록은 표시 없이 일반 마크다운으로 저장한다. 허용 목록에 없는 값은 무시한다.

export const TEXT_ALIGNS = ["left", "center", "right"] as const;
export const LINE_HEIGHTS = ["tight", "normal", "relaxed", "loose"] as const;
export const IMAGE_ALIGNS = ["full", "left", "center", "right"] as const;

export type TextAlign = (typeof TEXT_ALIGNS)[number];
export type LineHeight = (typeof LINE_HEIGHTS)[number];
export type ImageAlign = (typeof IMAGE_ALIGNS)[number];

export const DEFAULT_TEXT_ALIGN: TextAlign = "left";
export const DEFAULT_LINE_HEIGHT: LineHeight = "normal";
export const DEFAULT_IMAGE_ALIGN: ImageAlign = "full";

/** 줄간격 메뉴(Figma Editor / Line Height Menu)에 보이는 이름과 값 */
export const LINE_HEIGHT_LABELS: Record<LineHeight, { label: string; value: string }> = {
  tight: { label: "좁게", value: "1.4" },
  normal: { label: "기본", value: "1.6" },
  relaxed: { label: "넓게", value: "1.9" },
  loose: { label: "아주 넓게", value: "2.2" },
};

export type TextBlockStyle = { align: TextAlign; lineHeight: LineHeight };

const pick = <T extends string>(allowed: readonly T[], value: unknown, fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export const toTextAlign = (value: unknown) => pick(TEXT_ALIGNS, value, DEFAULT_TEXT_ALIGN);
export const toLineHeight = (value: unknown) => pick(LINE_HEIGHTS, value, DEFAULT_LINE_HEIGHT);
export const toImageAlign = (value: unknown) => pick(IMAGE_ALIGNS, value, DEFAULT_IMAGE_ALIGN);

/** 공개 화면 prose.css와 에디터가 함께 쓰는 클래스. 기본값은 클래스를 붙이지 않는다. */
export function textBlockClasses({ align, lineHeight }: TextBlockStyle) {
  const classes: string[] = [];
  if (align !== DEFAULT_TEXT_ALIGN) classes.push(`md-align-${align}`);
  if (lineHeight !== DEFAULT_LINE_HEIGHT) classes.push(`md-lh-${lineHeight}`);
  return classes;
}

export const imageClass = (align: ImageAlign) => `md-image-${align}`;

/** `align=center lh=relaxed` → { align: "center", lh: "relaxed" } (에디터 쪽 읽기. 렌더러는 remark-directive가 읽는다) */
export function parseDirectiveAttributes(source: string) {
  const attributes: Record<string, string> = {};
  for (const [, key, quoted, bare] of source.matchAll(/([a-z]+)=(?:"([^"]*)"|([^\s"}]+))/g)) {
    attributes[key!] = quoted ?? bare ?? "";
  }
  return attributes;
}

/** 문단·제목 한 블록을 감싼다. 기본값만 있으면 그대로 둔다. */
export function wrapTextBlock(markdown: string, { align, lineHeight }: TextBlockStyle) {
  const attributes = [
    align !== DEFAULT_TEXT_ALIGN && `align=${align}`,
    lineHeight !== DEFAULT_LINE_HEIGHT && `lh=${lineHeight}`,
  ].filter(Boolean);
  return attributes.length ? `:::p{${attributes.join(" ")}}\n${markdown}\n:::` : markdown;
}

/** 이미지 한 장을 감싼다. 기본값(전체 폭)이면 그대로 둔다. */
export function wrapImage(markdown: string, align: ImageAlign) {
  return align === DEFAULT_IMAGE_ALIGN ? markdown : `:::image{align=${align}}\n${markdown}\n:::`;
}

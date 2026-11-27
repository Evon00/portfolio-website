// 카드 전체 클릭: 카드를 <a>로 감싸지 않고, 제목 링크의 ::after를 카드(가장 가까운 position 조상) 크기로 늘린다.
// 화면 낭독기는 제목만 링크 이름으로 읽는다. 카드 안의 다른 버튼(코드·사이트)은 relative z-10으로 이 영역 위에 올린다.
// 제목 링크와 카드 사이 요소에는 position을 주지 않는다(::after가 그 요소 크기로 줄어든다).
// ::after는 z-1이라 뒤에 오는 위치 지정 요소(테이프·태그)보다 위에서 클릭을 받는다. 투명해서 보이는 모양은 그대로다.
export const CARD_LINK = "outline-none after:absolute after:inset-0 after:z-1 after:content-['']";

/** 카드에 붙이는 키보드 포커스: 제목 링크(data-card-link)에 키보드 포커스가 오면 카드 외곽에 1px primary 선 + 글로우. */
export const CARD_FOCUS_RING = "has-[[data-card-link]:focus-visible]:focus-glow";

/**
 * 카드 안 "자세히 보기 →" 표시(장식, aria-hidden): 카드 활성(hover · 키보드 포커스)일 때 0.55로 연해진다
 * (Figma Project Card State=Hover, Text Link hover와 같은 규칙). 카드 활성 변형은 globals.css의 card-active.
 */
export const CARD_MORE =
  "text-label-m text-primary-strong transition-opacity duration-(--duration-hover) group-card-active:opacity-55";

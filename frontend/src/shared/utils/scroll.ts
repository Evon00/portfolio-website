// 페이지 안 이동(맨 위로 · 연락하기)을 주소의 #해시 없이 코드로 한다.
// #해시로 이동하면 주소에 해시가 남고, 같은 주소를 다시 누르면 Next가 스크롤하지 않아 두 번째부터 움직이지 않는다.
// 줄인 움직임 설정이면 애니메이션 없이 바로 이동하고, 이동한 곳으로 포커스를 옮긴다
// (포커스를 받을 수 없는 제목에는 tabindex=-1을 붙여 Tab 순서에는 넣지 않고 포커스만 받게 한다).

function smoothScroll() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function focusWithoutScroll(element: HTMLElement | null) {
  if (!element) return;
  if (!element.matches("a[href], button, input, textarea, select, [tabindex]")) element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
}

/** 맨 위로 이동하고 본문 제목(main h1)으로 포커스를 옮긴다. 부드럽게 이동하면 true. */
export function scrollToPageTop() {
  const smooth = smoothScroll();
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "instant" });
  focusWithoutScroll(document.querySelector<HTMLElement>("main h1"));
  return smooth;
}

/** id 영역(예: 푸터 연락처 #contact)으로 이동하고 그 영역의 제목, 없으면 첫 링크로 포커스를 옮긴다. 부드럽게 이동하면 true. */
export function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return false;
  const smooth = smoothScroll();
  section.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
  focusWithoutScroll(section.querySelector<HTMLElement>("h1, h2, h3") ?? section.querySelector<HTMLElement>("a[href]"));
  return smooth;
}

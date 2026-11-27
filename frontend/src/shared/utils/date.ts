// "2026.11.12" (한국 시간). 어드민 표의 작성일·등록일 표기.
const DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDate(iso: string) {
  const parts = Object.fromEntries(DATE_FORMAT.formatToParts(new Date(iso)).map((part) => [part.type, part.value]));
  return `${parts.year}.${parts.month}.${parts.day}`;
}

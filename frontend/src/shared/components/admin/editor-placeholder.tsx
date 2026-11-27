// 에디터 코드를 내려받는 동안 같은 자리를 잡아 둔다(레이아웃 흔들림 방지).
export function EditorPlaceholder() {
  return (
    <div
      role="status"
      className="flex min-h-[620px] items-center justify-center rounded-card border border-line-01 bg-background-01 text-body-m text-content-03"
    >
      에디터를 준비하는 중이에요…
    </div>
  );
}

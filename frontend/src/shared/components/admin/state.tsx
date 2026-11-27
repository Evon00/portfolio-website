import { InlineError } from "@/shared/components/inline-error";

// 어드민 조회 중 · 실패 표시 (Figma에 별도 시안이 없어 Inline Error와 Caption으로 맞춘다)
export function AdminLoading({ label = "불러오는 중이에요" }: { label?: string }) {
  return (
    <p role="status" className="py-16 text-center text-body-m text-content-03">
      {label}…
    </p>
  );
}

export function AdminLoadError({ onRetry }: { onRetry: () => void }) {
  return <InlineError title="데이터를 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." onRetry={onRetry} />;
}

"use client";

import { useRouter } from "next/navigation";
import { InlineError } from "@/shared/components/inline-error";

// Figma 메인 · 섹션 오류: 섹션 하나만 실패하면 그 자리에 Inline Error를 두고 나머지는 그대로 보여 준다.
// 다시 시도 = 현재 페이지를 서버에서 다시 그린다.
export function SectionError({ title }: { title: string }) {
  const router = useRouter();
  return <InlineError title={title} onRetry={() => router.refresh()} />;
}

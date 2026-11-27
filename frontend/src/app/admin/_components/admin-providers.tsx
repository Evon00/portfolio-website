"use client";

import type { ReactNode } from "react";
import { useSessionExpiredStore } from "@/features/auth/hooks/use-session-expired";
import { SessionExpiredOverlay } from "@/features/auth/ui/session-expired-overlay";
import { QueryProvider } from "@/shared/providers/query.provider";

// 어드민 공통: 조회·저장 중 401이 나면 만료 오버레이를 연다.
// 로그인 화면에서는 열지 않는다(이전 화면에서 늦게 도착한 401이 다시 띄우지 않게).
const expireSession = () => {
  if (window.location.pathname.startsWith("/admin/login")) return;
  useSessionExpiredStore.getState().expire();
};

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider onUnauthorized={expireSession}>
      {children}
      <SessionExpiredOverlay />
    </QueryProvider>
  );
}

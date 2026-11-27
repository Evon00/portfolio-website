"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { logoutAction } from "@/shared/libs/auth/auth.action";
import { clearAllDrafts } from "./use-session-draft";
import { useSessionExpiredStore } from "./use-session-expired";

// 로그아웃 (설계 문서 5절): 쿠키 삭제(서버 액션) → 쿼리 취소 → queryClient.clear() → 어드민 스토어 초기화 → router.refresh() → 이동.
// 이동은 전체 새로고침(window.location)으로 한다. Cache Components는 지나온 화면을 <Activity>로 숨겨 DOM에 남겨 두므로,
// 클라이언트 이동만 하면 어드민 화면의 데이터가 숨은 채 문서에 남는다(Next 문서 preserving-ui-state · State and authentication).
// - 직접 로그아웃: 초안을 지우고 /admin/login
// - 401 오버레이의 "사이트로 돌아가기": 같은 정리 후 / (다시 로그인하면 이어 쓸 수 있게 초안은 남긴다)
type LogoutOptions = { to?: string; keepDrafts?: boolean };

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useCallback(
    async ({ to = "/admin/login", keepDrafts = false }: LogoutOptions = {}) => {
      await logoutAction();
      await queryClient.cancelQueries();
      queryClient.clear();
      useSessionExpiredStore.getState().reset();
      if (!keepDrafts) clearAllDrafts();
      router.refresh();
      window.location.replace(to);
    },
    [queryClient, router],
  );
}

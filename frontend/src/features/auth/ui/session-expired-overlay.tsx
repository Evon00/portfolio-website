"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SessionExpiredDialog } from "@/shared/components/modal";
import { useLogout } from "../hooks/use-logout";
import { useSessionExpiredStore } from "../hooks/use-session-expired";

// Figma 오버레이 · 401 로그인 만료. 페이지를 떠나지 않고 띄운다(설계 문서 5절).
// 작성 중인 내용은 만료 순간 sessionStorage에 보관된다(use-session-draft).
// - 다시 로그인: 로그인 화면으로 가고, 로그인하면 이 페이지로 돌아와 초안을 복원한다.
// - 사이트로 돌아가기: 로그아웃과 같은 정리 후 메인으로.
export function SessionExpiredOverlay() {
  const expired = useSessionExpiredStore((state) => state.expired);
  const queryClient = useQueryClient();
  const router = useRouter();
  const logout = useLogout();

  return (
    <SessionExpiredDialog
      open={expired}
      onRelogin={async () => {
        // 캐시 비우기는 로그인 성공 때 한다. 여기서 비우면 화면의 쿼리가 다시 조회하며 401이 또 난다.
        await queryClient.cancelQueries();
        useSessionExpiredStore.getState().reset();
        // 현재 주소는 누른 순간에 읽는다(레이아웃에서 usePathname을 쓰면 동적 경로가 Suspense를 요구한다).
        const { pathname, search } = window.location;
        router.push(`/admin/login?next=${encodeURIComponent(pathname + search)}`);
      }}
      onLeave={() => logout({ to: "/", keepDrafts: true })}
    />
  );
}

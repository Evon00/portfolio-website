import { create } from "zustand";

// 401(로그인 만료) 오버레이 상태. QueryClient onError가 열고, 오버레이 버튼이 닫는다.
type SessionExpiredState = {
  expired: boolean;
  expire: () => void;
  reset: () => void;
};

export const useSessionExpiredStore = create<SessionExpiredState>((set) => ({
  expired: false,
  expire: () => set({ expired: true }),
  reset: () => set({ expired: false }),
}));

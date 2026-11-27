import { create } from "zustand";

// 모바일 메뉴 열림 상태. 서버 데이터가 아닌 UI 상태만 둔다.
type MobileMenuState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useMobileMenuStore = create<MobileMenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

import type { Metadata } from "next";
import { AdminProviders } from "@/app/admin/_components/admin-providers";

// 어드민 전체: 검색 제외(robots.ts와 함께), TanStack Query, 401 오버레이 (설계 문서 6·7절)
export const metadata: Metadata = {
  title: { template: "%s · 관리자", default: "관리자" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminProviders>{children}</AdminProviders>;
}

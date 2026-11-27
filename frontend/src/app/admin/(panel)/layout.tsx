import { getCachedProfile } from "@/shared/_controllers/profile/index.server";
import { AdminSidebar } from "@/widgets/admin-sidebar/admin-sidebar";

// 사이드바 + 본문. Figma 관리자 화면은 1920 데스크톱만 있다.
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  const profile = await getCachedProfile();
  return (
    <div className="flex min-h-dvh min-w-[1024px]">
      <AdminSidebar name={profile.name} />
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-10 pt-9 pb-12">{children}</main>
    </div>
  );
}

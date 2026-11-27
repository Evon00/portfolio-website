import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/ui/dashboard-view";
import { Button } from "@/shared/components/button";
import { AdminPageHeader } from "@/shared/components/admin/page-header";

export const metadata: Metadata = { title: "대시보드" };

export default function DashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="대시보드"
        actions={
          <>
            <Button href="/admin/projects/new" variant="outline" size="M">
              + 새 프로젝트
            </Button>
            <Button href="/admin/posts/new" size="M">
              + 새 게시글
            </Button>
          </>
        }
      />
      <DashboardView />
    </>
  );
}

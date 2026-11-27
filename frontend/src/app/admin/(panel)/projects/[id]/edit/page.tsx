import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectEdit } from "@/features/project/ui/admin/project-edit";
import { AdminLoading } from "@/shared/components/admin/state";

export const metadata: Metadata = { title: "프로젝트 수정" };

// 어드민은 브라우저에서 조회한다. 경로의 id는 클라이언트에서 꺼내 쓴다.
export default function EditProjectPage({ params }: PageProps<"/admin/projects/[id]/edit">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ProjectEdit params={params} />
    </Suspense>
  );
}

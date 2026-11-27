import type { Metadata } from "next";
import { ProjectTable } from "@/features/project/ui/admin/project-table";

export const metadata: Metadata = { title: "프로젝트" };

export default function AdminProjectsPage() {
  return <ProjectTable />;
}

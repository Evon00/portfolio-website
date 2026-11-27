import type { Metadata } from "next";
import { SkillTable } from "@/features/skill/ui/skill-table";

export const metadata: Metadata = { title: "기술 스택" };

export default function AdminSkillsPage() {
  return <SkillTable />;
}

import type { Metadata } from "next";
import { ProfileEditor } from "@/features/profile/ui/profile-form";

export const metadata: Metadata = { title: "프로필" };

export default function AdminProfilePage() {
  return <ProfileEditor />;
}

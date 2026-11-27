import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/ui/login-form";
import { getCachedProfile } from "@/shared/_controllers/profile/index.server";

export const metadata: Metadata = { title: "로그인" };

// 이미 로그인했으면 proxy.ts가 어드민으로 보낸다. 돌아갈 주소(next)는 브라우저에서 읽는다.
export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const profile = await getCachedProfile();
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 pt-28 pb-16">
      <Suspense>
        <LoginForm name={profile.name} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

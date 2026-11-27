"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, use, useEffect, useState, useTransition } from "react";
import { Button } from "@/shared/components/button";
import { AlertDanger, FormLabel, TextField } from "@/shared/components/form";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { TextLink } from "@/shared/components/text-link";
import { loginAction } from "@/shared/libs/auth/auth.action";
import { safeAdminPath } from "@/shared/libs/auth/session-token";
import { useSessionExpiredStore } from "../hooks/use-session-expired";

// Figma 관리자 · 로그인. 로그인하면 캐시를 비우고 원래 가려던 어드민 페이지(없으면 대시보드)로 간다.
// 실패 응답(401)이 만료 오버레이를 열지 않도록 useMutation이 아닌 transition으로 부른다.
type LoginFormProps = { name: string; searchParams: Promise<{ next?: string | string[] }> };

export function LoginForm({ name, searchParams }: LoginFormProps) {
  const { next } = use(searchParams);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // 만료 오버레이에서 넘어왔으면 오버레이 상태를 정리한다.
  useEffect(() => useSessionExpiredStore.getState().reset(), []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");
    if (!username.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await loginAction({ username, password });
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      queryClient.clear();
      useSessionExpiredStore.getState().reset();
      router.replace(safeAdminPath(Array.isArray(next) ? next[0] : next));
    });
  }

  return (
    <div className="relative w-[440px] max-w-full">
      {/* 카드(440) 오른쪽 끝에서 30 안쪽에 둔다. 왼쪽 기준이면 카드가 좁아질 때(모바일) 화면 밖으로 나가 가로로 넘친다. */}
      <PaperAsset name="blob-blue-sleepy" className="-top-[90px] right-[30px] h-[130px] w-[190px]" priority />
      <form
        onSubmit={submit}
        noValidate
        className="relative flex flex-col rounded-pill border border-line-01 bg-background-01 px-[37px] pt-11 pb-10"
      >
        <h1 className="text-center font-display text-title-2 text-content-01">{name}.log</h1>
        <p className="mt-2.5 text-center text-label-m text-content-02">관리자 로그인</p>
        {error && <AlertDanger className="mt-[30px]">{error}</AlertDanger>}
        <div className="mt-5 flex flex-col gap-2">
          <FormLabel htmlFor="login-username">아이디</FormLabel>
          <TextField id="login-username" name="username" autoComplete="username" placeholder="username" autoFocus />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <FormLabel htmlFor="login-password">비밀번호</FormLabel>
          <TextField
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="password"
          />
        </div>
        <Button type="submit" disabled={pending} className="mt-6 w-full">
          {pending ? "로그인 중…" : "로그인"}
        </Button>
        <TextLink href="/" className="mt-[18px] self-center">
          ← 사이트로 돌아가기
        </TextLink>
      </form>
    </div>
  );
}

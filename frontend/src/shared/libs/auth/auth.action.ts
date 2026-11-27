"use server";

import { auth } from "@/shared/_controllers/data-source.server";
import { type ApiResult, apiFailure, apiSuccess } from "@/shared/libs/api";
import { clearSessionCookies, setSessionCookies } from "./auth";

// 로그인·로그아웃 서버 액션 (설계 문서 5절).
// Spring 로그인 API(_controllers/auth/auth.api.ts)가 준 access · refresh 토큰을 httpOnly 쿠키에 담는다.

export async function loginAction(input: {
  username: string;
  password: string;
}): Promise<ApiResult<{ expiresAt: number }>> {
  try {
    const refresh = await setSessionCookies(await auth.signIn(input));
    return apiSuccess({ expiresAt: refresh.exp * 1000 });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function logoutAction(): Promise<ApiResult<null>> {
  await clearSessionCookies();
  return apiSuccess(null);
}

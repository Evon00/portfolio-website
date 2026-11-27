"use server";

import { auth } from "@/shared/_controllers/data-source.server";
import { type ApiResult, apiFailure, apiSuccess } from "@/shared/libs/api";
import { clearSessionCookies, getRefreshToken, setSessionCookies } from "./auth";

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

/** Spring에서 refresh를 지운 뒤 쿠키를 지운다. Spring 호출이 실패해도(이미 만료 등) 쿠키는 지워 로그아웃시킨다. */
export async function logoutAction(): Promise<ApiResult<null>> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) await auth.signOut(refreshToken).catch(() => undefined);
  await clearSessionCookies();
  return apiSuccess(null);
}

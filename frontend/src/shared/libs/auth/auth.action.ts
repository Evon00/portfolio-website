"use server";

import { auth } from "@/shared/_controllers/data-source.server";
import { type ApiResult, apiFailure, apiSuccess } from "@/shared/libs/api";
import { clearSessionCookie, setSessionCookie } from "./auth";

// 로그인·로그아웃 서버 액션 (설계 문서 5절).
// 아이디·비밀번호 확인과 토큰 발급은 data-source.server.ts가 고른 구현이 한다(지금은 _mock/auth.ts).
// 6단계: Spring 로그인 API를 부르는 구현으로 바꾸고, 응답의 토큰을 같은 쿠키에 담는다.

export async function loginAction(input: {
  username: string;
  password: string;
}): Promise<ApiResult<{ expiresAt: number }>> {
  try {
    const { token, payload } = await auth.signIn(input);
    await setSessionCookie(token, payload);
    return apiSuccess({ expiresAt: payload.exp * 1000 });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function logoutAction(): Promise<ApiResult<null>> {
  await clearSessionCookie();
  return apiSuccess(null);
}

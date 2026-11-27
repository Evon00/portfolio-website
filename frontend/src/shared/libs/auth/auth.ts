import "server-only";

import { cookies } from "next/headers";
import { REFRESH_COOKIE, SESSION_COOKIE, readTokenPayload, sessionCookieOptions } from "./session-token";

// 관리자 세션 읽기·쓰기 (설계 문서 5절). 쿠키를 읽으므로 'use cache' 함수 안에서는 부르지 않는다.
export type AdminSession = { role: "admin"; username: string; expiresAt: number };

/** 로그인 상태는 refresh 토큰 기준이다. access가 만료돼도 refresh가 살아 있으면 proxy.ts가 재발급한다. */
export async function getSession(): Promise<AdminSession | null> {
  const payload = readTokenPayload((await cookies()).get(REFRESH_COOKIE)?.value);
  return payload ? { role: "admin", username: payload.sub, expiresAt: payload.exp * 1000 } : null;
}

/** 어드민 API 호출에 싣는 access 토큰. 만료됐거나 형식이 틀린 토큰은 싣지 않는다. */
export async function getAccessToken() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readTokenPayload(token) ? (token ?? null) : null;
}

/** 로그인 응답의 두 토큰을 쿠키에 담는다. 만료 시각은 각 토큰의 exp와 맞춘다. */
export async function setSessionCookies(tokens: { accessToken: string; refreshToken: string }) {
  const access = readTokenPayload(tokens.accessToken);
  const refresh = readTokenPayload(tokens.refreshToken);
  if (!access || !refresh) throw new Error("로그인 토큰 형식이 올바르지 않아요.");

  const store = await cookies();
  store.set(SESSION_COOKIE, tokens.accessToken, sessionCookieOptions(access.exp));
  store.set(REFRESH_COOKIE, tokens.refreshToken, sessionCookieOptions(refresh.exp));
  return refresh;
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete({ name: SESSION_COOKIE, path: "/" });
  store.delete({ name: REFRESH_COOKIE, path: "/" });
}

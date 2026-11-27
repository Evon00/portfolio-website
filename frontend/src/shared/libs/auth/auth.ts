import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, type SessionPayload, verifySessionToken } from "./session-token";

// 관리자 세션 읽기·쓰기 (설계 문서 5절). 쿠키를 읽으므로 'use cache' 함수 안에서는 부르지 않는다.
export type AdminSession = { role: "admin"; username: string; expiresAt: number };

export async function getSession(): Promise<AdminSession | null> {
  const payload = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  return payload ? { role: "admin", username: payload.sub, expiresAt: payload.exp * 1000 } : null;
}

/** 어드민 API 호출에 싣는 토큰. 만료됐거나 잘못된 토큰은 싣지 않는다. */
export async function getAccessToken() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return (await verifySessionToken(token)) ? (token ?? null) : null;
}

/** httpOnly · secure(개발 환경 제외) · sameSite=lax · path=/ · 만료 시각을 토큰 exp와 맞춘다. */
export async function setSessionCookie(token: string, payload: SessionPayload) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    expires: new Date(payload.exp * 1000),
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/" });
}

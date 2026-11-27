import "server-only";

import { ApiError, toApiErrorBody } from "@/shared/libs/api/error";

// 관리자 인증 API (Spring /api/auth/*). data-source.server.ts가 이 파일을 고른다.
// 생성기 결과가 아니라 직접 쓴 파일이다. Spring이 refresh 토큰을 본문이 아닌 Set-Cookie 헤더로 주므로,
// 본문만 돌려주는 apiClient 대신 fetch로 응답 헤더까지 읽는다.
const AUTH_TIMEOUT_MS = 15_000;
/** Spring이 refresh 토큰을 담는 쿠키 이름 (CookieUtil.REFRESH_TOKEN) */
const SPRING_REFRESH_COOKIE = "refreshToken";

export type AuthTokens = { accessToken: string; refreshToken: string };

async function postAuth(path: string, init: { body?: object; refreshToken?: string }) {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new ApiError({ message: "API_BASE_URL이 설정되지 않았어요." });

  const response = await fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.refreshToken ? { Cookie: `${SPRING_REFRESH_COOKIE}=${init.refreshToken}` } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = toApiErrorBody(body);
    throw new ApiError({ status: response.status, message: errorBody?.message ?? response.statusText, data: errorBody });
  }
  return { response, body };
}

/** 로그인·재발급 응답에서 access(본문 data.accessToken)와 refresh(Set-Cookie)를 꺼낸다. */
function toAuthTokens(response: Response, body: unknown): AuthTokens {
  const accessToken = (body as { data?: { accessToken?: unknown } } | null)?.data?.accessToken;
  const refreshToken = response.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith(`${SPRING_REFRESH_COOKIE}=`))
    ?.split(";")[0]
    .slice(SPRING_REFRESH_COOKIE.length + 1);

  if (typeof accessToken !== "string" || !refreshToken) {
    throw new ApiError({ status: 502, message: "로그인 응답에 토큰이 없어요." });
  }
  return { accessToken, refreshToken };
}

/** 아이디·비밀번호로 로그인한다. 틀리면 Spring의 401 메시지를 담은 ApiError */
export async function signIn(input: { username: string; password: string }): Promise<AuthTokens> {
  const { response, body } = await postAuth("/api/auth/login", {
    body: { adminUsername: input.username.trim(), adminPassword: input.password },
  });
  return toAuthTokens(response, body);
}

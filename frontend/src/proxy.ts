import { type NextRequest, NextResponse } from "next/server";
// 재발급은 proxy만 하므로 data-source.server.ts(목 구현까지 함께 불러온다)를 거치지 않고 auth.api를 직접 부른다.
import { type AuthTokens, refreshTokens } from "@/shared/_controllers/auth/auth.api";
import type { ApiErrorBody } from "@/shared/libs/api/error";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  readTokenPayload,
  safeAdminPath,
  sessionCookieOptions,
} from "@/shared/libs/auth/session-token";

// 어드민 1차 방어 (설계 문서 5절). 최종 확인은 서버 액션·라우트 핸들러의 guard(withAdminAction · withAdminRoute)가 한다.
// - 로그인 상태는 refresh 토큰 기준이다. access가 없거나 곧 만료되면 여기서 Spring에 재발급을 요청한다.
//   (화면을 그리는 도중에는 쿠키를 저장할 수 없어서, 모든 어드민 요청 앞에서 도는 여기 한 곳에서 한다)
// - /api/admin/*: 세션이 없으면 401 JSON
// - /admin/*: 세션이 없으면 /admin/login?next=원래 주소로 보낸다
// - /admin/login: 이미 로그인했으면 어드민(next 또는 대시보드)으로 보낸다
// - 서버 액션 요청(next-action 헤더)은 그대로 통과시킨다. 리다이렉트하면 액션 응답이 깨지므로 guard가 401 결과로 답한다.
// - 어드민 화면은 브라우저가 저장해 두지 않게 한다(로그아웃 뒤 뒤로가기로 저장된 화면을 다시 보여 주지 않고 여기를 거치게).

/** access 만료가 이 시간(초) 안으로 남으면 미리 재발급한다. 요청 도중 만료되지 않게 */
const ACCESS_RENEW_MARGIN_SECONDS = 30;
/** 같은 refresh 토큰으로 온 재발급 결과를 나눠 쓰는 시간 */
const REFRESH_SHARE_MS = 10_000;

// Spring은 재발급할 때마다 refresh를 바꾸므로, 동시 요청이 같은 refresh로 각각 재발급하면 두 번째부터 실패한다.
// 같은 refresh로 온 재발급은 Spring을 한 번만 부르고 결과를 나눠 쓴다(서버 한 대 기준, 메모리 보관).
const pendingRefresh = new Map<string, Promise<AuthTokens>>();

function refreshOnce(refreshToken: string) {
  let pending = pendingRefresh.get(refreshToken);
  if (!pending) {
    pending = refreshTokens(refreshToken);
    pendingRefresh.set(refreshToken, pending);
    setTimeout(() => pendingRefresh.delete(refreshToken), REFRESH_SHARE_MS);
  }
  return pending;
}

/** 로그인 여부와, 재발급했다면 새 토큰. 재발급에 실패하면(만료·이미 쓴 refresh·Spring 오류) 로그인이 풀린 것으로 본다. */
async function resolveSession(request: NextRequest): Promise<{ loggedIn: boolean; tokens: AuthTokens | null }> {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken || !readTokenPayload(refreshToken)) return { loggedIn: false, tokens: null };
  if (readTokenPayload(request.cookies.get(SESSION_COOKIE)?.value, ACCESS_RENEW_MARGIN_SECONDS)) {
    return { loggedIn: true, tokens: null };
  }
  try {
    return { loggedIn: true, tokens: await refreshOnce(refreshToken) };
  } catch {
    return { loggedIn: false, tokens: null };
  }
}

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const { loggedIn, tokens } = await resolveSession(request);
  const hadCookies = request.cookies.has(SESSION_COOKIE) || request.cookies.has(REFRESH_COOKIE);

  // 다음 단계로 넘긴다. 재발급했으면 이번 요청의 쿠키도 바꿔서 뒤의 Route Handler·서버 액션이 새 access를 쓰게 한다.
  function pass() {
    if (!tokens) return NextResponse.next();
    request.cookies.set(SESSION_COOKIE, tokens.accessToken);
    request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // 브라우저 쿠키 반영: 재발급했으면 새 토큰을 저장하고, 로그인이 풀렸으면 남은 쿠키를 지운다.
  function finish(response: NextResponse) {
    if (tokens) {
      const access = readTokenPayload(tokens.accessToken);
      const refresh = readTokenPayload(tokens.refreshToken);
      if (access) response.cookies.set(SESSION_COOKIE, tokens.accessToken, sessionCookieOptions(access.exp));
      if (refresh) response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, sessionCookieOptions(refresh.exp));
    } else if (!loggedIn && hadCookies) {
      response.cookies.delete(SESSION_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
    }
    return response;
  }

  if (pathname === "/admin/login") {
    return finish(
      loggedIn
        ? NextResponse.redirect(new URL(safeAdminPath(searchParams.get("next")), request.url))
        : noStore(NextResponse.next()),
    );
  }
  if (request.headers.has("next-action")) return finish(pass());
  if (loggedIn) return finish(pathname.startsWith("/api/admin") ? pass() : noStore(pass()));

  if (pathname.startsWith("/api/admin")) {
    const body: ApiErrorBody = { code: "UNAUTHORIZED", message: "로그인이 만료됐어요." };
    return finish(NextResponse.json(body, { status: 401 }));
  }
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return finish(NextResponse.redirect(login));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

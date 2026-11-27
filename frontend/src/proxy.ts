import { type NextRequest, NextResponse } from "next/server";
import type { ApiErrorBody } from "@/shared/libs/api/error";
import { SESSION_COOKIE, safeAdminPath, verifySessionToken } from "@/shared/libs/auth/session-token";

// 어드민 1차 방어 (설계 문서 5절). 최종 확인은 서버 액션·라우트 핸들러의 guard(withAdminAction · withAdminRoute)가 한다.
// - /api/admin/*: 세션이 없으면 401 JSON
// - /admin/*: 세션이 없으면 /admin/login?next=원래 주소로 보낸다
// - /admin/login: 이미 로그인했으면 어드민(next 또는 대시보드)으로 보낸다
// - 서버 액션 요청(next-action 헤더)은 그대로 통과시킨다. 리다이렉트하면 액션 응답이 깨지므로 guard가 401 결과로 답한다.
// - 어드민 화면은 브라우저가 저장해 두지 않게 한다(로그아웃 뒤 뒤로가기로 저장된 화면을 다시 보여 주지 않고 여기를 거치게).
function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    return session
      ? NextResponse.redirect(new URL(safeAdminPath(searchParams.get("next")), request.url))
      : noStore(NextResponse.next());
  }
  if (request.headers.has("next-action")) return NextResponse.next();
  if (session) return pathname.startsWith("/api/admin") ? NextResponse.next() : noStore(NextResponse.next());

  if (pathname.startsWith("/api/admin")) {
    const body: ApiErrorBody = { code: "UNAUTHORIZED", message: "로그인이 만료됐어요." };
    return NextResponse.json(body, { status: 401 });
  }
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

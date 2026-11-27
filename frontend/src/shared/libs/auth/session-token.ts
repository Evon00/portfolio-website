// 관리자 세션 토큰 (설계 문서 5절). 서버(auth.ts)와 proxy.ts가 같이 쓰므로 server-only·next/headers에 기대지 않는다.
//
// Spring이 준 JWT 두 개를 Next의 httpOnly 쿠키에 담는다. 브라우저 JS는 토큰을 볼 수 없다.
// - access(15분): Spring 호출 때 Authorization: Bearer로 싣는다.
// - refresh(14일): access가 만료되면 proxy.ts가 Spring에 재발급을 요청할 때 쓴다. 로그인 상태는 refresh 기준이다.
// 서명은 여기서 확인하지 않고 exp만 읽는다. 토큰이 맞는지는 Spring이 매 요청마다 확인한다.
export const SESSION_COOKIE = "portfolio_admin_session";
export const REFRESH_COOKIE = "portfolio_admin_refresh";

/** JWT에서 읽는 값. sub는 관리자 id, exp는 만료 시각(초). */
export type TokenPayload = { sub: string; exp: number };

function fromBase64Url(text: string) {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** JWT 본문(sub · exp)을 읽는다. 형식이 틀렸거나 만료(marginSeconds 안에 만료 포함)면 null. 서명은 확인하지 않는다. */
export function readTokenPayload(token: string | undefined, marginSeconds = 0): TokenPayload | null {
  const body = token?.split(".")[1];
  if (!body) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Partial<TokenPayload>;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > Date.now() / 1000 + marginSeconds ? { sub: payload.sub, exp: payload.exp } : null;
  } catch {
    return null;
  }
}

/** 세션 쿠키 설정. httpOnly · secure(개발 환경 제외) · sameSite=lax · path=/ · 만료 시각은 토큰 exp와 맞춘다. */
export function sessionCookieOptions(exp: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(exp * 1000),
  };
}

/** 로그인 뒤 돌아갈 주소. 어드민 안쪽 경로만 허용한다(외부 주소로 보내는 오픈 리다이렉트 방지). */
export function safeAdminPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/login")) return "/admin";
  return next;
}

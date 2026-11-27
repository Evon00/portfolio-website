// 관리자 세션 토큰 (설계 문서 5절). 서버(auth.ts)와 proxy.ts가 같이 쓰므로 server-only·next/headers에 기대지 않는다.
//
// 목 단계 토큰: base64url(payload) + "." + base64url(HMAC-SHA256(payload, ADMIN_MOCK_SESSION_SECRET))
// 6단계(Spring 연결)에서는 Spring이 준 JWT를 그대로 쿠키에 담고, 여기서 Spring JWKS 공개키로 서명·exp를 확인한다(jose). 목 HMAC은 그때 지운다.
export const SESSION_COOKIE = "portfolio_admin_session";
/** 세션 길이 2시간. 쿠키 만료와 토큰 exp를 같이 맞춘다. */
export const SESSION_TTL_SECONDS = 60 * 60 * 2;

export type SessionPayload = { sub: string; exp: number };

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sign(data: string) {
  const secret = process.env.ADMIN_MOCK_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_MOCK_SESSION_SECRET이 설정되지 않았어요.");
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data))));
}

/** 목 계정 로그인 성공 때 발급한다. */
export async function createSessionToken(sub: string, ttlSeconds = SESSION_TTL_SECONDS) {
  const payload: SessionPayload = { sub, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return { token: `${body}.${await sign(body)}`, payload };
}

/** 형식·서명·만료를 확인한다. 하나라도 어긋나면 null(로그인 안 됨). */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    if ((await sign(body)) !== signature) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Partial<SessionPayload>;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > Date.now() / 1000 ? { sub: payload.sub, exp: payload.exp } : null;
  } catch {
    return null;
  }
}

/** 로그인 뒤 돌아갈 주소. 어드민 안쪽 경로만 허용한다(외부 주소로 보내는 오픈 리다이렉트 방지). */
export function safeAdminPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/login")) return "/admin";
  return next;
}

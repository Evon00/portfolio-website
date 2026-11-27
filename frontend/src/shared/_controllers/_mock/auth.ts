import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/shared/libs/api";
import { createSessionToken } from "@/shared/libs/auth/session-token";

// 로그인 목 구현. 아이디·비밀번호는 .env.local의 ADMIN_MOCK_USERNAME · ADMIN_MOCK_PASSWORD와 비교한다(코드에 쓰지 않는다).
// 맞으면 목 세션 토큰(HMAC 서명, session-token.ts)을 만든다. data-source.server.ts가 이 파일을 고른다.
// Spring 연결 때 Spring 로그인 API를 부르는 구현으로 바꾸면 이 파일은 지운다(설계 문서 5절).

/** 길이와 상관없이 같은 시간에 비교한다(값을 한 글자씩 추측하는 공격 방지). */
function safeEqual(a: string, b: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}

/** 아이디·비밀번호를 확인하고 세션 토큰을 돌려준다. 틀리면 401 */
export async function signIn(input: { username: string; password: string }) {
  const username = process.env.ADMIN_MOCK_USERNAME;
  const password = process.env.ADMIN_MOCK_PASSWORD;
  if (!username || !password)
    throw new ApiError({ status: 500, message: "로그인 설정이 비어 있어요. 환경 변수를 확인해 주세요." });

  const ok = safeEqual(input.username.trim(), username) && safeEqual(input.password, password);
  if (!ok) throw new ApiError({ status: 401, message: "아이디 또는 비밀번호가 일치하지 않아요." });

  return createSessionToken(username);
}

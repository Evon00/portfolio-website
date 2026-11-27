import { ApiError, type ApiErrorBody } from "./error";

// 브라우저 → Next 라우트 핸들러(/api/admin/*) 조회. 실패 응답을 ApiError로 바꿔
// QueryClient의 onError 한 곳에서 401(로그인 만료)을 처리하게 한다(설계 문서 3절).
// 401 알림. 쿼리·뮤테이션 밖에서 부르는 조회(슬러그 확인·이미지 업로드)도 같은 만료 오버레이를 열게 한다.
const unauthorizedListeners = new Set<() => void>();

export function onAdminUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

type AdminFetchInit = RequestInit & {
  /** JSON 본문 (넣으면 기본 메서드가 POST) */
  json?: unknown;
  /** 쿼리 문자열. 값이 없는 항목은 빠진다. */
  query?: object;
};

export async function adminFetch<T>(path: string, init: AdminFetchInit = {}): Promise<T> {
  const { json, query, headers, ...rest } = init;
  const search = new URLSearchParams(
    Object.entries(query ?? {}).flatMap(([key, value]) => (value == null ? [] : [[key, String(value)]])),
  ).toString();
  const response = await fetch(search ? `${path}?${search}` : path, {
    ...rest,
    ...(json === undefined ? {} : { method: rest.method ?? "POST", body: JSON.stringify(json) }),
    headers: { ...(json === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) unauthorizedListeners.forEach((listener) => listener());
    // Route Handler · proxy가 돌려주는 프론트 자체 오류 모양(ApiErrorBody, guard.ts). 백엔드 형식과는 무관하다.
    const error = data as ApiErrorBody | null;
    throw new ApiError({
      status: response.status,
      message: error?.message ?? "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.",
      data: error?.code ? error : undefined,
    });
  }
  return data as T;
}

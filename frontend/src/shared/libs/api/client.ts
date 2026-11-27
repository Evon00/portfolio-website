import "server-only";

import { getAccessToken } from "@/shared/libs/auth/auth";
import { ApiError, toApiErrorBody } from "./error";

// 이 API 클라이언트의 규칙:
// - 브라우저는 Spring을 직접 부르지 않으므로 서버 전용(server-only)이고, 주소는 API_BASE_URL 하나만 쓴다.
// - 401을 ApiError(status 401)로 만드는 곳이 여기 한 곳이다(설계 문서 3절).
// - 설정은 두 가지: 공개용(publicApiClient, 인증 없음)과 어드민용(adminApiClient, 쿠키 토큰).
const DEFAULT_API_TIMEOUT_MS = 15_000;

type JsonObject = object;

export type ApiClientOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonObject | unknown[] | null;
  parseJson?: (text: string) => unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
};

function getApiBaseUrl() {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new ApiError({ message: "API_BASE_URL이 설정되지 않았어요." });
  }
  return baseUrl;
}

function createApiUrl(path: string, query?: ApiClientOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, getApiBaseUrl());

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function isJsonBody(body: ApiClientOptions["body"]): body is JsonObject | unknown[] {
  return Boolean(body) && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob);
}

async function parseResponseBody(response: Response, parseJson?: ApiClientOptions["parseJson"]) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const text = await response.text();

    return parseJson ? parseJson(text) : JSON.parse(text);
  }

  return response.text();
}

/**
 * 성공 응답 본문에서 실제 데이터를 꺼낸다. 모든 성공 응답이 여기를 한 번 지난다.
 * 응답 감싸기 형식(예: `{ code, message, data }`)이 정해지면 이 함수 안만 고친다. 지금은 그대로 통과시킨다.
 */
function unwrapSuccessBody(body: unknown): unknown {
  return body;
}

/**
 * 목록 응답에서 항목 배열을 꺼낸다. 목록을 부르는 `<도메인>.api.ts`가 쓴다.
 * 목록 페이지 형식(예: `{ content, totalElements, totalPages }`)이 정해지면 이 함수 안만 고쳐서, 부르는 쪽은 바뀌지 않게 한다.
 * 그래서 입력은 형식을 가정하지 않는 `unknown`으로 받는다. 지금은 배열을 그대로 통과시킨다.
 * 페이지 형식이 정해지면 항목과 함께 페이지 정보(전체 개수 · 페이지 수)를 돌려줘야 할 수 있다. 그때 반환 모양을 정한다.
 */
export function unwrapListBody<T>(body: unknown): T[] {
  return body as T[];
}

type ApiClient = <T>(path: string, options?: ApiClientOptions) => Promise<T>;

function createApiClient(getAuthHeaders?: () => Promise<Record<string, string>>): ApiClient {
  return async function request<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const { body, headers, parseJson, query, timeoutMs = DEFAULT_API_TIMEOUT_MS, ...requestInit } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const shouldJsonStringify = isJsonBody(body);

    try {
      const response = await fetch(createApiUrl(path, query), {
        ...requestInit,
        body: shouldJsonStringify ? JSON.stringify(body) : body,
        headers: {
          ...(shouldJsonStringify ? { "Content-Type": "application/json" } : {}),
          ...(await getAuthHeaders?.()),
          ...headers,
        },
        signal: controller.signal,
      });
      const data = await parseResponseBody(response, response.ok ? parseJson : undefined);

      if (!response.ok) {
        const errorBody = toApiErrorBody(data);
        throw new ApiError({
          status: response.status,
          message: errorBody?.message ?? response.statusText,
          data: errorBody,
        });
      }

      return unwrapSuccessBody(data) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError({
          message: `Request timed out after ${timeoutMs} ms`,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

/** 공개용: 인증 정보 없이 부른다. 쿠키를 읽지 않으므로 'use cache' 함수(<도메인>.cached.ts) 안에서 쓴다. */
export const publicApiClient = createApiClient();

/** 어드민용: 세션 쿠키의 토큰을 Authorization에 싣는다. 요청마다 쿠키를 읽으므로 'use cache' 안에서는 쓰지 않는다. */
export const adminApiClient = createApiClient(async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
});

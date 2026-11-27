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
 * Spring은 모든 응답을 `{ isSuccess, code, message, data }`(CommonApiResponse)로 감싼다. `data`만 돌려준다.
 * 데이터 없는 성공 응답은 `data`가 빠져 있으므로 null이다.
 * 목록은 `data`가 페이지 응답(`{ pageNumber, pageSize, totalPages, totalElements, content, … }`)이고, 타입은 생성기가 만든다.
 * 생성기(`scripts/controller-generator`)도 응답 타입을 `data` 기준으로 잡으므로, 형식이 바뀌면 두 곳을 같이 고친다.
 */
function unwrapSuccessBody(body: unknown): unknown {
  if (body && typeof body === "object" && "isSuccess" in body) {
    return (body as { data?: unknown }).data ?? null;
  }
  return body;
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

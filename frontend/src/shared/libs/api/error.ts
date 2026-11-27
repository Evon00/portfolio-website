// API 호출 실패를 표현하는 공통 에러입니다.
// `src/app/error.tsx`는 렌더링이 실패했을 때 보여주는 글로벌 에러 화면이고,
// 이 파일의 `ApiError`는 400/401/404/500, timeout 같은 API 응답 실패를
// TanStack Query나 server action에서 다루기 위한 데이터 계층 에러입니다.

/**
 * 프론트가 쓰는 오류 응답 모양. 백엔드 오류 형식과 무관하게 화면 · Route Handler · proxy가 이 모양만 본다.
 * (`_generated`의 오류 모델에 기대지 않는다. 백엔드 스키마 이름이 달라져도 여기는 그대로다.)
 */
export type ApiErrorBody = { code?: string; message?: string };

/**
 * Spring 오류 응답 본문 → ApiErrorBody. 백엔드 오류 형식을 프론트 모양으로 바꾸는 곳은 여기 한 곳이다(`client.ts`가 부른다).
 * Spring 오류는 `{ isSuccess: false, code, message, data? }`(CommonApiResponse)다. 예: `{ code: "POST_001", message: "…" }`.
 * 400 검증 오류는 필드 정보 없이 첫 번째 오류 문구가 `message`로 온다(code `COMMON_400`).
 */
export function toApiErrorBody(data: unknown): ApiErrorBody | undefined {
  if (!data || typeof data !== "object") return undefined;
  const { code, message } = data as Record<string, unknown>;
  const body: ApiErrorBody = {
    ...(typeof code === "string" ? { code } : {}),
    ...(typeof message === "string" ? { message } : {}),
  };
  return Object.keys(body).length > 0 ? body : undefined;
}

export type ApiErrorPayload = {
  status?: number;
  message: string;
  data?: ApiErrorBody;
};

export class ApiError extends Error {
  status?: number;
  data?: ApiErrorBody;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.data = payload.data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  return new ApiError({
    message: getErrorMessage(error),
  });
}

import "server-only";

import { NextResponse } from "next/server";
import { ApiError, type ApiErrorBody, type ApiResult, apiFailure, apiSuccess, toApiError } from "@/shared/libs/api";
import { getSession } from "./auth";

// 어드민 서버 액션·라우트 핸들러를 감싸는 인증 확인(설계 문서 5절). proxy.ts는 1차 방어이고, 여기가 최종 확인이다.
const UNAUTHORIZED = new ApiError({ status: 401, message: "로그인이 만료됐어요." });

/** 서버 액션 본문을 감싼다. 세션이 없으면 실행하지 않고 401 실패를 돌려준다. */
export async function withAdminAction<T>(run: () => Promise<T>): Promise<ApiResult<T>> {
  try {
    if (!(await getSession())) throw UNAUTHORIZED;
    return apiSuccess(await run());
  } catch (error) {
    return apiFailure(error);
  }
}

/** 라우트 핸들러를 감싼다. 성공은 데이터 JSON, 실패는 상태 코드 + ApiErrorBody JSON(프론트 자체 오류 모양). */
export function withAdminRoute<C>(handler: (request: Request, context: C) => Promise<unknown>) {
  return async (request: Request, context: C) => {
    try {
      if (!(await getSession())) throw UNAUTHORIZED;
      return NextResponse.json(await handler(request, context));
    } catch (error) {
      const apiError = toApiError(error);
      const body: ApiErrorBody = { code: apiError.data?.code ?? "ERROR", message: apiError.message };
      return NextResponse.json(body, { status: apiError.status ?? 500 });
    }
  };
}

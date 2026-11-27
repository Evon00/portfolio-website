import "server-only";

// 도메인별 데이터 구현을 고르는 곳. 목 ↔ 실제 API 전환은 여기 한 곳에서만 한다(환경 변수 스위치는 두지 않는다).
// - 화면·캐시·액션은 <도메인>.service.ts(로그인은 auth.action.ts)만 부르고, 그 파일들이 이 줄을 따른다.
// - 목은 실제 구현(<도메인>/<도메인>.api.ts)과 같은 모양이어야 한다. `satisfies typeof <도메인>Api`가 typecheck로 확인한다.
//   .api.ts는 `import type`으로만 불러 목 단계에서는 실행 경로(API 클라이언트)에 들어오지 않는다.
// - Spring 연결: 도메인마다 세 줄(목 import · type import · export)을 `export * as <도메인> from "./<도메인>/<도메인>.api";` 한 줄로 바꾼다.
// - 모든 줄을 바꾼 뒤의 정리 순서는 AGENTS.md "Spring 연결 순서".
// auth는 Set-Cookie를 읽어야 해서 생성기가 아닌 직접 쓴 .api.ts다.
export * as auth from "./auth/auth.api";

export * as post from "./post/post.api";
// 조회수 증가는 방문자 헤더를 넘겨야 해서 직접 쓴 .api.ts다(post-view.api.ts).
export * as postView from "./post/post-view.api";

export * as project from "./project/project.api";

export * as skill from "./skill/skill.api";

export * as profile from "./profile/profile.api";

import * as dashboardMock from "./_mock/dashboard";
import type * as DashboardApi from "./dashboard/dashboard.api";
export const dashboard = dashboardMock satisfies typeof DashboardApi;

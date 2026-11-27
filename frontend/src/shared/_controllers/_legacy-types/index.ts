// 예전 예시 OpenAPI 문서로 만든 타입(목 단계의 화면·목·도메인 코드가 씀). 백엔드 타입은 src/shared/_generated에 있다.
// Spring을 연결하는 도메인마다 이 타입을 걷어 내고, 모두 연결하면 폴더째 지운다. 생성기가 다시 만들지 않으므로 손으로 고치지 않는다.
export type * from "./models";
export type * from "./params";

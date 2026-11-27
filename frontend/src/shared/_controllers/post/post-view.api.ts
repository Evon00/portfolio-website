import "server-only";

import type { IncreasePostViewPath, IncreasePostViewResponseDto } from "@/shared/_generated";
import { publicApiClient } from "@/shared/libs/api/client";

// 조회수 증가는 방문자 IP · User-Agent를 헤더로 넘겨야 해서(OpenAPI 문서에 없는 헤더) 생성기가 아닌 직접 쓴 .api.ts다.
// Spring은 같은 서버(Next)에서 온 요청의 X-Forwarded-For만 믿고 방문자 IP로 쓴다(forward-headers-strategy=native).
export type Visitor = { ip: string | null; userAgent: string | null };

export async function increasePostView(params: IncreasePostViewPath, visitor: Visitor) {
  return publicApiClient<IncreasePostViewResponseDto>(`/api/post/${params.postId}/view`, {
    method: "POST",
    headers: {
      ...(visitor.ip ? { "X-Forwarded-For": visitor.ip } : {}),
      ...(visitor.userAgent ? { "User-Agent": visitor.userAgent } : {}),
    },
  });
}

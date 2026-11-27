import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/shared/libs/api/error";

// 어드민 QueryClient. 조회(라우트 핸들러)와 저장(서버 액션) 어느 쪽에서 401이 나도 같은 곳에서 만료 오버레이를 연다.
export function createQueryClient(onUnauthorized: () => void) {
  const handleError = (error: unknown) => {
    if (isApiError(error) && error.status === 401) onUnauthorized();
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // 4xx(없음·권한·잘못된 요청)는 다시 해도 같으므로 5xx·네트워크 오류만 한 번 더 시도한다.
        retry: (count, error) => count < 1 && !(isApiError(error) && error.status && error.status < 500),
      },
    },
  });
}

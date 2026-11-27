"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { onAdminUnauthorized } from "@/shared/libs/api/admin-fetch";
import { createQueryClient } from "./query-client";

// 어드민 전용 TanStack Query. 공개 페이지는 'use cache'로 서버에서 그리므로 쓰지 않는다(설계 문서 3절).
export function QueryProvider({ onUnauthorized, children }: { onUnauthorized: () => void; children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient(onUnauthorized));
  useEffect(() => onAdminUnauthorized(onUnauthorized), [onUnauthorized]);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

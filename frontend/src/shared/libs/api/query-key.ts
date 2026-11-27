type QueryKeyPart = string | number | boolean | null | undefined | Record<string, unknown>;

export function createDomainQueryKeys<const TDomain extends string>(domain: TDomain) {
  return {
    all: [domain] as const,
    lists: () => [domain, "list"] as const,
    list: (...params: QueryKeyPart[]) => [domain, "list", ...params] as const,
    details: () => [domain, "detail"] as const,
    detail: (id: string | number) => [domain, "detail", id] as const,
  };
}

// 어드민 조회 키. 저장·삭제 뒤에는 도메인 단위(all)로 무효화한다.
export const adminQueryKeys = {
  dashboard: createDomainQueryKeys("admin-dashboard"),
  posts: createDomainQueryKeys("admin-posts"),
  projects: createDomainQueryKeys("admin-projects"),
  skills: createDomainQueryKeys("admin-skills"),
  profile: createDomainQueryKeys("admin-profile"),
};

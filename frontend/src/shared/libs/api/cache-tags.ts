// 공개 페이지 캐시 태그 (설계 문서 6절). 캐시 함수의 cacheTag와 서버 액션의 updateTag가 같은 이름을 쓰도록 한 곳에 둔다.
export const CACHE_TAGS = {
  posts: "posts",
  projects: "projects",
  profile: "profile",
  skills: "skills",
  post: (postId: number) => `post-${postId}`,
  project: (projectId: number) => `project-${projectId}`,
} as const;

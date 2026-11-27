import "server-only";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "./cache-tags";

// 어드민 저장·삭제 서버 액션이 성공한 뒤 부르는 캐시 무효화(설계 문서 6절). updateTag는 서버 액션 안에서만 동작한다.
// 4단계 어드민 액션에서 쓰고, 실제 무효화 확인은 Spring 연결(6단계) 때 한다.

export function invalidatePost(postId?: number) {
  if (postId !== undefined) updateTag(CACHE_TAGS.post(postId));
  updateTag(CACHE_TAGS.posts);
}

export function invalidateProject(projectId?: number) {
  if (projectId !== undefined) updateTag(CACHE_TAGS.project(projectId));
  updateTag(CACHE_TAGS.projects);
}

export function invalidateProfile() {
  updateTag(CACHE_TAGS.profile);
}

/** 기술 스택은 카드·상세·히어로에 함께 들어가므로 skills 태그 하나로 모두 비운다. */
export function invalidateSkills() {
  updateTag(CACHE_TAGS.skills);
}

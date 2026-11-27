import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/shared/libs/api";
import { findProfile } from "./profile.service";
import { toProfileView } from "./profile.types";

// 히어로 · 헤더 · 푸터가 쓰는 프로필. 로그인과 무관한 공개 데이터만 캐시한다.
export async function getCachedProfile() {
  "use cache";
  cacheTag(CACHE_TAGS.profile, CACHE_TAGS.skills);
  cacheLife("days");
  return toProfileView(await findProfile());
}

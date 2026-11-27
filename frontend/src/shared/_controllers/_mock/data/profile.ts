import type { ProfileResponse } from "@/shared/_controllers/_legacy-types";
import { mockSkills as s } from "./skills";

// Figma 메인 히어로 · 푸터 문구
export const mockProfile: ProfileResponse = {
  name: "유재혁",
  role: "BACKEND DEVELOPER",
  intro: "백엔드를 설계부터 운영 배포까지 책임지고,\n팀이 반복하는 작업을 표준으로 만드는 백엔드 개발자입니다.",
  email: "hello@example.com",
  githubUrl: "https://github.com/evon00",
  avatarUrl: null,
  coreSkills: [s.java, s.springBoot, s.springSecurity, s.mariadb, s.redis],
};

import type { PostCardView } from "@/shared/_controllers/post";
import type { ProjectCardView } from "@/shared/_controllers/project";
import type { SkillView } from "@/shared/components/skill";

// /ui 미리보기 전용 값. 실제 목 데이터는 shared/_controllers/_mock에 있다.
const skills = (names: string[]): SkillView[] => names.map((name) => ({ name, iconUrl: null }));

export const previewProjects: ProjectCardView[] = [
  {
    slug: "knu-robot-bootcamp",
    title: "경북대학교 로봇 부트캠프 사이트",
    summary: "대학 사업 신청·운영 사이트 백엔드를 단독으로 맡아 약 1개월 만에 운영 배포",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    skills: skills(["Java 21", "Spring Boot", "Spring Security", "JPA", "MariaDB", "Redis", "JWT", "AES", "NCloud"]),
    thumbnailUrl: "/images/panels/panel-blue-wide.webp",
    githubUrl: "https://github.com/example/knu",
    demoUrl: "https://example.com",
    repoPrivate: true,
  },
  {
    slug: "payment-shop",
    title: "페이먼트 쇼핑몰",
    summary: "결제·주문·재고 정합성을 책임진 커머스 백엔드 (설계·개발 90%)",
    startDate: "2025-12-01",
    endDate: null,
    skills: skills([
      "Java 21",
      "Spring Boot",
      "Redis",
      "MariaDB",
      "토스페이먼츠",
      "Docker",
      "Nginx",
      "JWT",
      "WebSocket",
      "Elasticsearch",
      "JPA",
    ]),
    thumbnailUrl: "/images/panels/panel-lavender-wide.webp",
    githubUrl: "https://github.com/example/shop",
    demoUrl: null,
    repoPrivate: false,
  },
  {
    slug: "mirmo",
    title: "MIRMO & MirrorMotion",
    summary: "미용실 태블릿 광고·콘텐츠 플랫폼 — 서버 간 인증, 영상 파이프라인, CI/CD, 지연 일정 회복",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    skills: skills([
      "Java 21",
      "Spring Boot",
      "FFmpeg",
      "Tika",
      "Bitbucket Pipelines",
      "systemd",
      "Nginx",
      "Docker",
      "Logback",
      "Redis",
      "JWKS",
      "OAuth2",
    ]),
    thumbnailUrl: null,
    githubUrl: "https://github.com/example/mirmo",
    demoUrl: "https://example.com/mirmo",
    repoPrivate: false,
  },
  {
    slug: "portfolio",
    title: "포트폴리오 블로그",
    summary: "Next.js 16 캐시 컴포넌트와 Spring Boot로 만든 개인 사이트",
    startDate: "2026-11-01",
    endDate: null,
    skills: skills(["Spring Boot", "Redis"]),
    thumbnailUrl: null,
    githubUrl: null,
    demoUrl: null,
    repoPrivate: false,
  },
];

const day = 24 * 60 * 60 * 1000;
const isoDaysAgo = (days: number) => new Date(Date.UTC(2026, 10, 25) - days * day).toISOString();

export const previewPosts: PostCardView[] = [
  {
    slug: "common-module",
    title: "반복되는 기능 15종을 사내 공통 모듈로 만들기",
    summary:
      "파일 업로드·JWT·AES·OAuth·본인인증·결제처럼 프로젝트마다 새로 만들던 기능을 골라 쓰는 모듈로 정리하고 문서화한 과정",
    publishedAt: isoDaysAgo(6),
    viewCount: 1284,
    skills: skills(["Spring Boot", "JWT", "Redis", "AES"]),
    thumbnailUrl: null,
  },
  {
    slug: "bitbucket-pipelines",
    title: "nohup에서 Bitbucket Pipelines로, 배포 10분 → 3분",
    summary: "systemd 등록과 self-hosted Runner로 PR 머지만으로 배포되는 파이프라인을 만들기까지",
    publishedAt: "2026-11-05T09:00:00.000Z",
    viewCount: 962,
    skills: skills(["Bitbucket Pipelines", "Docker", "Nginx", "systemd", "Redis", "MariaDB", "Logback", "JWT"]),
    thumbnailUrl: "/images/panels/panel-cream-wide.webp",
  },
];

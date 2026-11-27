import type { ProjectDetailResponse, ProjectSummaryResponse } from "@/shared/_controllers/_legacy-types";
import { mockSkills as s } from "./skills";

// Figma 프로젝트 목록 · 상세 · 메인 캐러셀 문구. 이미지는 public/mock/images의 "MOCK IMAGE" 표시 그림이다.
// 마지막 두 개(공통 모듈 · 포트폴리오)는 목록 2페이지·진행 중 상태를 보이기 위한 목 항목이다.
const img = (name: string) => `/mock/images/${name}.webp`;

const KNU_CONTENT = `## 프로젝트 소개

대학 사업의 부트캠프·장려금·이수증 신청 접수와 관리자 CMS(게시판·배너·팝업·약관), 관리자 대시보드를 제공하는 사이트입니다. 백엔드를 혼자 맡아 ERD 설계부터 운영 배포까지 약 1개월(7/2 – 8/3) 만에 완료했습니다.

- 서비스 : 운영 중 · robotics.knu.ac.kr
- 기간 : 2026.07 ~ 2026.09 (개발 7/2 – 8/3, 이후 유지보수)
- 팀 구성 : 4명 (기획 1 · 디자인 1 · 프론트 1 · 백엔드 1)
- 역할 : 백엔드 단독 담당 · 커밋 331 / 331

## 주요 기능

- 부트캠프·장려금·이수증 신청 접수, 상태 이력, 결과 조회
- 관리자 대시보드, 신청 관리
- 게시판(공지·자료실), 배너·팝업·푸터·약관 관리
- 관리자 IP 접근 관리

## 사용 기술

- BackEnd : Java 21, Spring Boot 3.5.16, Spring Security, JPA·JDBC
- DB : MariaDB, Redis
- 보안 : JWT, AES, IP 접근 제어, Rate Limit
- Infra : NCloud Object Storage + Global Edge(CDN), Nginx, Docker
- etc : Apache Tika, Thumbnailator, WebP

## 문제 해결

### 1. 같은 학생의 신청이 동시에 여러 번 저장될 수 있음

- 문제 : 신청 버튼을 연속으로 누르거나 요청이 동시에 들어오면, 중복 여부를 확인하는 시점과 저장 시점 사이에 틈이 생겨 중복 신청이 저장될 수 있었습니다.
- 해결 : 학번+이메일을 키로 Redis \`setIfAbsent\` 락(TTL 10초)을 걸어 같은 학생의 요청은 한 번에 하나만 처리되게 했습니다. TTL로 장애 시에도 락이 영구히 남지 않게 했습니다.
- 결과 : 동시 요청에서도 학생당 신청 1건이 보장되었습니다.

> 같은 패턴을 사내 공통 모듈에 넣어 다른 프로젝트에서도 쓰고 있습니다.

### 2. 관리자 페이지와 공개 API가 외부 공격에 노출됨

- 문제 : 학생 개인정보를 다루는 관리자 페이지가 누구나 접근 가능한 주소였고, 비로그인 신청 API는 반복 요청에 무방비였습니다.
- 해결 : 관리자 API는 IP 화이트리스트, 공개 API는 IP 블랙리스트 인터셉터로 접근 제어
  - 전체 API에 Rate Limit(60초 100회) 적용
  - 화이트리스트가 비어 있으면 전체 허용 + 경고 로그로 처리해, 설정 실수로 관리자가 잠기는 사고를 방지하고 관리자 화면에서 IP를 직접 관리하는 API 추가
  - Nginx CSP 헤더, HTTPS 쿠키, CORS 설정
- 결과 : 등록된 IP에서만 관리자에 접근할 수 있게 되었습니다.

### 3. 개인정보가 DB에 평문으로 저장됨

- 문제 : 리팩터링 단계에서 점검해 보니 생년월일·연락처·이메일이 평문으로 저장되고 있었습니다.
- 해결 : AES 암호화를 적용하고 관련 조회·수정 로직을 함께 고쳤습니다. 화면에서 쓰이지 않는 관리자 감사 로그 테이블은 오버엔지니어링으로 판단해 제거했습니다.
- 결과 : DB가 유출되더라도 개인정보를 바로 읽을 수 없는 구조가 되었습니다.

### 4. 수동 SSL 인증서 설치

- 문제 : 카페24 SSL은 인증서·체인 인증서·암호화된 개인키를 직접 받아 설치해야 했습니다.
- 해결 : 도메인 소유권 인증 → 인증서와 체인을 fullchain으로 병합 → 개인키 복호화 → Nginx 적용 순서로 설치하고, 갱신 절차를 문서로 남겼습니다.
- 결과 : HTTPS와 Global Edge(CDN) 전환을 마쳤고, 다음 갱신도 같은 절차로 처리할 수 있게 되었습니다.

## 성과

- 백엔드 단독으로 약 1개월 만에 설계부터 운영 배포까지 완료
- ERD 7/2–7/3 → API 명세 7/3–7/6 → 로직 설계 7/6–7/8 → 개발 7/9–7/16 → 리팩터링·보안 7/20–7/22 → 배포 7/23–7/24 → SSL·CDN 전환 8/3
- 사내 공통 모듈 구조를 재사용해 초기 세팅 시간을 줄였습니다.
- Jira 티켓 35건으로 설계 → 개발 → 리팩터링 → 배포 전 과정을 관리했습니다.
`;

const shortContent = (summary: string) => `## 프로젝트 소개

${summary}

## 주요 기능

- 목 데이터 단계의 예시 본문입니다.
- Spring API가 연결되면 관리자에서 쓴 본문이 표시됩니다.
`;

type MockProject = ProjectDetailResponse & Pick<ProjectSummaryResponse, "featured">;

export const mockProjects: MockProject[] = [
  {
    projectId: 1,
    slug: "knu-robot-bootcamp",
    title: "경북대학교 로봇 부트캠프 사이트",
    summary: "대학 사업 신청·운영 사이트 백엔드를 단독으로 맡아 약 1개월 만에 운영 배포",
    startDate: "2026-07-02",
    endDate: "2026-09-30",
    githubUrl: "https://github.com/evon00/knu-robot-bootcamp",
    demoUrl: "https://robotics.knu.ac.kr",
    repoPrivate: true,
    featured: true,
    content: KNU_CONTENT,
    images: [
      { imageId: 1, url: img("knu-1"), caption: "학번+이메일 락으로 학생당 1건만 저장" },
      { imageId: 2, url: img("knu-2"), caption: "관리자 대시보드" },
      { imageId: 3, url: img("knu-3"), caption: null },
      { imageId: 4, url: img("knu-4"), caption: "신청 상태 이력" },
    ],
    skills: [s.java, s.springBoot, s.springSecurity, s.jpa, s.mariadb, s.redis, s.jwt, s.aes, s.ncloud, s.tika],
  },
  {
    projectId: 2,
    slug: "payonlab-shop",
    title: "페이온랩 쇼핑몰",
    summary: "결제·주문·재고 정합성을 책임진 커머스 백엔드 (설계·개발 90%)",
    startDate: "2025-12-01",
    endDate: "2026-04-30",
    githubUrl: "https://github.com/evon00/payonlab-shop",
    demoUrl: null,
    repoPrivate: false,
    featured: true,
    content: shortContent("결제·주문·재고 정합성을 책임진 커머스 백엔드 (설계·개발 90%)"),
    images: [{ imageId: 5, url: img("shop-1"), caption: null }],
    skills: [s.java, s.springBoot, s.jpa, s.mariadb, s.redis, s.tossPayments, s.docker, s.nginx, s.jwt],
  },
  {
    projectId: 3,
    slug: "mirmo-mirrormotion",
    title: "MIRMO & MirrorMotion",
    summary: "미용실 태블릿 광고·콘텐츠 플랫폼 — 서버 간 인증, 영상 파이프라인, CI/CD, 지연 일정 회복",
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    githubUrl: "https://github.com/evon00/mirmo",
    demoUrl: "https://example.com/mirmo",
    repoPrivate: false,
    featured: true,
    content: shortContent("미용실 태블릿 광고·콘텐츠 플랫폼 — 서버 간 인증, 영상 파이프라인, CI/CD, 지연 일정 회복"),
    images: [],
    skills: [
      s.java,
      s.springBoot,
      s.jwks,
      s.oauth2,
      s.ffmpeg,
      s.bitbucket,
      s.systemd,
      s.nginx,
      s.docker,
      s.logback,
      s.redis,
    ],
  },
  {
    projectId: 4,
    slug: "hairbear",
    title: "HairBear",
    summary: "헤어 업계 소셜·채용·커머스 플랫폼 — social 모듈 단독 설계·구현",
    startDate: "2026-06-01",
    endDate: null,
    githubUrl: null,
    demoUrl: null,
    repoPrivate: true,
    featured: true,
    content: shortContent("헤어 업계 소셜·채용·커머스 플랫폼 — social 모듈 단독 설계·구현"),
    images: [],
    skills: [s.java, s.springBoot, s.springModulith, s.jpa, s.mariadb, s.redis, s.elasticsearch],
  },
  {
    projectId: 5,
    slug: "van-pos-website",
    title: "VAN&POS 웹사이트",
    summary: "결제단말기 기업 사이트 + 관리자, 백엔드 단독 담당으로 4주 만에 배포",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    githubUrl: "https://github.com/evon00/van-pos",
    demoUrl: "https://example.com/vanpos",
    repoPrivate: false,
    featured: true,
    content: shortContent("결제단말기 기업 사이트 + 관리자, 백엔드 단독 담당으로 4주 만에 배포"),
    images: [{ imageId: 6, url: img("vanpos-1"), caption: null }],
    skills: [s.java, s.springBoot, s.springSecurity, s.mariadb, s.nginx, s.docker],
  },
  {
    projectId: 6,
    slug: "ai-smart-factory",
    title: "AI 스마트 공장 관제 대시보드",
    summary: "AI Box·추론 서버 데이터를 WebSocket으로 받아 대시보드에 실시간 전달하는 관제 서버",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    githubUrl: "https://github.com/evon00/smart-factory",
    demoUrl: null,
    repoPrivate: false,
    featured: true,
    content: shortContent("AI Box·추론 서버 데이터를 WebSocket으로 받아 대시보드에 실시간 전달하는 관제 서버"),
    images: [{ imageId: 7, url: img("factory-1"), caption: null }],
    skills: [s.java, s.springBoot, s.websocket, s.redis, s.docker],
  },
  {
    projectId: 7,
    slug: "common-module",
    title: "사내 공통 모듈 라이브러리",
    summary: "파일 업로드·JWT·AES·OAuth·본인인증·결제 등 반복 기능 15종을 골라 쓰는 모듈로 정리",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    githubUrl: null,
    demoUrl: null,
    repoPrivate: true,
    featured: false,
    content: shortContent("파일 업로드·JWT·AES·OAuth·본인인증·결제 등 반복 기능 15종을 골라 쓰는 모듈로 정리"),
    images: [],
    skills: [s.java, s.springBoot, s.jwt, s.aes, s.oauth2, s.redis],
  },
  {
    projectId: 8,
    slug: "portfolio-blog",
    title: "포트폴리오 · 개발 블로그",
    summary: "Next.js 16 캐시 컴포넌트 프론트와 Spring Boot 백엔드로 만든 개인 사이트",
    startDate: "2026-11-01",
    endDate: null,
    githubUrl: "https://github.com/evon00/portfolio",
    demoUrl: null,
    repoPrivate: false,
    featured: false,
    content: shortContent("Next.js 16 캐시 컴포넌트 프론트와 Spring Boot 백엔드로 만든 개인 사이트"),
    images: [],
    skills: [s.java, s.springBoot, s.springSecurity, s.mariadb],
  },
];

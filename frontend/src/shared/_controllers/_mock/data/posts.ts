import type { PostDetailResponse } from "@/shared/_generated";
import { mockSkills as s } from "./skills";

// Figma 블로그 목록 · 상세 문구. 상세 본문은 "Redis setIfAbsent로 중복 신청 막기"(Figma 블로그 상세)만 시안 그대로이고
// 나머지는 짧은 예시 본문이다. 이미지 설명은 마크다운 title 자리에 둔다: ![대체텍스트](주소 "설명")
const img = (name: string) => `/mock/images/${name}.webp`;

const REDIS_CONTENT = `![Redis 락 흐름](${img("post-redis-lock")})

## 문제 — 확인과 저장 사이의 틈

신청 버튼을 연속으로 누르거나 요청이 동시에 들어오면, 중복 여부를 확인하는 시점과 저장하는 시점 사이에 틈이 생겨 같은 학생의 신청이 두 번 저장될 수 있었습니다.

- 학번+이메일을 키로 Redis 락을 먼저 잡습니다.
- \`setIfAbsent\`와 TTL 10초로, 장애가 나도 락이 영구히 남지 않게 합니다.
- 락을 얻지 못한 요청은 바로 거절합니다.

### 구현

\`StringRedisTemplate\`으로 락을 잡고, 신청을 저장한 뒤 락을 풉니다.

\`\`\`java
Boolean locked = redis.opsForValue()
    .setIfAbsent(lockKey, "1", Duration.ofSeconds(10));
\`\`\`

![학번+이메일 락 구조](${img("knu-1")} "학번+이메일 락으로 학생당 1건만 저장")

> TTL을 두면 서버가 내려가도 락은 10초 뒤 사라집니다.

## 결과

동시 요청에서도 학생당 신청 1건이 보장되었고, 같은 패턴을 공통 모듈에 넣어 다른 프로젝트에서도 쓰고 있습니다.
`;

const shortContent = (summary: string, code?: { lang: string; body: string }) => `## 배경

${summary}

## 정리

- 목 데이터 단계의 예시 본문입니다.
- Spring API가 연결되면 관리자에서 쓴 본문이 표시됩니다.
${code ? `\n\`\`\`${code.lang}\n${code.body}\n\`\`\`\n` : ""}`;

export const mockPosts: PostDetailResponse[] = [
  {
    postId: 1,
    slug: "common-module-15",
    title: "반복되는 기능 15종을 사내 공통 모듈로 만들기",
    summary:
      "파일 업로드·JWT·AES·OAuth·본인인증·결제처럼 프로젝트마다 새로 만들던 기능을 골라 쓰는 모듈로 정리하고 문서화한 과정",
    thumbnailUrl: img("post-common-module"),
    viewCount: 1284,
    publishedAt: "2026-11-19T09:00:00+09:00",
    updatedAt: "2026-11-19T09:00:00+09:00",
    content: `![공통 모듈 구조도](${img("post-common-module")} "공통 모듈 구조")\n\n${shortContent(
      "파일 업로드·JWT·AES·OAuth·본인인증·결제처럼 프로젝트마다 새로 만들던 기능을 골라 쓰는 모듈로 정리하고 문서화한 과정",
      { lang: "kotlin", body: 'implementation("com.example:common-auth:1.4.0")' },
    )}`,
    skills: [s.springBoot, s.jwt, s.redis, s.aes],
  },
  {
    postId: 2,
    slug: "bitbucket-pipelines-deploy",
    title: "nohup에서 Bitbucket Pipelines로, 배포 10분 → 3분",
    summary: "systemd 등록과 self-hosted Runner로 PR 머지만으로 배포되는 파이프라인을 만들기까지",
    thumbnailUrl: null,
    viewCount: 962,
    publishedAt: "2026-11-05T09:00:00+09:00",
    updatedAt: "2026-11-05T09:00:00+09:00",
    content: shortContent("systemd 등록과 self-hosted Runner로 PR 머지만으로 배포되는 파이프라인을 만들기까지", {
      lang: "yaml",
      body: "pipelines:\n  branches:\n    main:\n      - step:\n          runs-on: [self.hosted, linux]\n          script:\n            - ./gradlew bootJar\n            - sudo systemctl restart app",
    }),
    skills: [s.bitbucket, s.docker, s.nginx, s.systemd],
  },
  {
    postId: 3,
    slug: "logback-log-policy",
    title: "logback으로 환경별 로그 정책 세우기",
    summary: "개발은 콘솔, 운영은 일자별 롤링. app.log와 error.log를 나누고 MariaDB Audit까지 수집한 기준",
    thumbnailUrl: null,
    viewCount: 731,
    publishedAt: "2026-10-28T09:00:00+09:00",
    updatedAt: "2026-10-28T09:00:00+09:00",
    content: shortContent(
      "개발은 콘솔, 운영은 일자별 롤링. app.log와 error.log를 나누고 MariaDB Audit까지 수집한 기준",
      {
        lang: "xml",
        body: '<springProfile name="prod">\n  <root level="INFO">\n    <appender-ref ref="ROLLING" />\n  </root>\n</springProfile>',
      },
    ),
    skills: [s.springBoot, s.logback, s.mariadb],
  },
  {
    postId: 4,
    slug: "redis-setifabsent-lock",
    title: "Redis setIfAbsent로 중복 신청 막기",
    summary: "확인과 저장 사이의 틈 때문에 생기던 중복 신청을 학번+이메일 락으로 해결한 기록",
    thumbnailUrl: img("post-redis-lock"),
    viewCount: 1105,
    publishedAt: "2026-10-16T09:00:00+09:00",
    updatedAt: "2026-10-16T09:00:00+09:00",
    content: REDIS_CONTENT,
    skills: [s.redis, s.springBoot, s.mariadb],
  },
  {
    postId: 5,
    slug: "admin-ip-whitelist-rate-limit",
    title: "관리자 페이지를 IP 화이트리스트와 Rate Limit으로 지키기",
    summary: "개인정보를 다루는 관리자와 공개 신청 API를 IP 접근 제어와 경로별 Rate Limit으로 보호한 방법",
    thumbnailUrl: img("post-ip-guard"),
    viewCount: 648,
    publishedAt: "2026-10-02T09:00:00+09:00",
    updatedAt: "2026-10-02T09:00:00+09:00",
    content: `![IP 접근 제어 구성](${img("post-ip-guard")})\n\n${shortContent(
      "개인정보를 다루는 관리자와 공개 신청 API를 IP 접근 제어와 경로별 Rate Limit으로 보호한 방법",
    )}`,
    skills: [s.springSecurity, s.redis, s.nginx],
  },
  {
    postId: 6,
    slug: "jpa-n-plus-one",
    title: "신청 목록 조회의 N+1을 fetch join 없이 줄이기",
    summary: "목 데이터: 페이지네이션과 함께 쓸 수 있도록 batch size와 DTO 조회로 쿼리 수를 줄인 과정",
    thumbnailUrl: null,
    viewCount: 412,
    publishedAt: "2026-09-18T09:00:00+09:00",
    updatedAt: "2026-09-18T09:00:00+09:00",
    content: shortContent("페이지네이션과 함께 쓸 수 있도록 batch size와 DTO 조회로 쿼리 수를 줄인 과정", {
      lang: "properties",
      body: "spring.jpa.properties.hibernate.default_batch_fetch_size=100",
    }),
    skills: [s.jpa, s.mariadb, s.springBoot],
  },
];

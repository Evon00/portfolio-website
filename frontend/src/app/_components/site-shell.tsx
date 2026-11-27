import type { ReactNode } from "react";
import { getCachedProfile } from "@/shared/_controllers/profile/index.server";
import { BackToTop } from "@/shared/components/back-to-top";
import { Footer } from "@/widgets/footer/footer";
import { Header } from "@/widgets/header/header";

// 공개 페이지 공통 틀: 헤더 + 본문 + 푸터. 이름·연락처는 캐시된 프로필(profile 태그)에서 읽는다.
// (public) 레이아웃과, 레이아웃 밖에서 그려지는 루트 not-found가 함께 쓴다.
export async function SiteShell({ children }: { children: ReactNode }) {
  const profile = await getCachedProfile();
  return (
    <>
      <Header name={profile.name} email={profile.email} githubUrl={profile.githubUrl} />
      {/* 기울인 캐릭터·종이 에셋이 화면 밖으로 조금 나가도 가로 스크롤이 생기지 않게 자른다(clip은 sticky를 깨지 않는다). */}
      <main className="flex-1 overflow-x-clip">{children}</main>
      <Footer name={profile.name} intro={profile.intro} email={profile.email} githubUrl={profile.githubUrl} />
      <BackToTop />
    </>
  );
}

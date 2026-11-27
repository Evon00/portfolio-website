import { ContactButton } from "@/shared/components/contact-button";
import { GUTTER } from "@/shared/components/container";
import { cn } from "@/shared/utils";
import { MobileMenu, MobileMenuButton } from "@/widgets/mobile-menu/mobile-menu";
import { SiteLogo } from "@/shared/components/site-logo";
import { NavItem } from "./nav-item";

// Figma Components › Header. Desktop(768 이상)=메뉴 노출, Mobile=햄버거 → 드로어.
// 콘텐츠 최대폭 1120. 연락하기는 주소를 바꾸지 않고 푸터 연락처로 스크롤한다(ContactButton).
export type SiteHeaderProps = {
  name: string;
  email: string;
  githubUrl: string;
};

export function Header(props: SiteHeaderProps) {
  const { name, email, githubUrl } = props;
  return (
    <header
      className={cn(GUTTER, "flex max-w-[calc(1120px+2*var(--gutter))] items-center justify-between py-fluid-16-28")}
    >
      <SiteLogo name={name} size="desktop" className="hidden md:inline-flex" />
      <SiteLogo name={name} size="mobile" className="md:hidden" />
      <nav aria-label="주요 메뉴" className="hidden items-center gap-2 md:flex">
        <NavItem href="/projects">프로젝트</NavItem>
        <NavItem href="/blog">블로그</NavItem>
        <ContactButton size="M" />
      </nav>
      <MobileMenuButton />
      <MobileMenu name={name} email={email} githubUrl={githubUrl} />
    </header>
  );
}

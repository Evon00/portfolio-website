import { cacheLife } from "next/cache";
import Link from "next/link";
import { Icon, type IconName } from "@/shared/components/icon";
import { PaperAsset } from "@/shared/components/paper/paper-asset";
import { ScrollTopLink } from "@/shared/components/scroll-top-link";

// Figma Components › Footer. 연락처. 콘텐츠 최대폭 1120, 768 미만은 Mobile.
// 바탕: primary-light 위에 종이 질감 100px 타일을 multiply로 겹친다. 위쪽에 캐릭터 둘이 걸쳐 있다.
export type SiteFooterProps = {
  name: string;
  intro: string;
  email: string;
  githubUrl: string;
};

export function Footer(props: SiteFooterProps) {
  const { name, intro, email, githubUrl } = props;
  return (
    <footer
      id="contact"
      className="relative mt-auto border-t-2 border-primary-muted bg-primary-light px-fluid-20-40 pt-fluid-84-96 pb-fluid-28-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(/images/paper-texture.webp)] bg-size-[100px_100px] mix-blend-multiply"
      />
      <div className="relative mx-auto flex max-w-[1120px] flex-col gap-fluid-40-56">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3.5 md:w-[480px]">
            {/* 연락처 영역 제목. "연락하기"로 이동하면 여기에 포커스가 온다(scrollToSection). */}
            <h2 className="font-mono text-mono-l text-content-02">CONTACT</h2>
            <p className="font-display text-title-2 text-content-01 md:text-title-1">{name}</p>
            <p className="text-body-l text-content-01">{intro}</p>
          </div>
          <ul className="flex flex-col gap-1 md:w-[380px]">
            <ContactRow icon="mail" label="EMAIL" href={`mailto:${email}`}>
              {email}
            </ContactRow>
            <ContactRow icon="code" label="GITHUB" href={githubUrl}>
              {githubUrl.replace(/^https?:\/\//, "")}
            </ContactRow>
            <ContactRow icon="pencil" label="BLOG" href="/blog">
              블로그 글 보러 가기 →
            </ContactRow>
          </ul>
        </div>
        <div className="flex items-center justify-between border-t-[1.5px] border-dashed border-primary-muted pt-5">
          <p className="text-caption text-content-02 md:text-body-m">
            © <CopyrightYear /> {name}. All rights reserved.
          </p>
          <ScrollTopLink />
        </div>
        <PaperAsset
          name="blob-cream-smile"
          className="-top-fluid-144-183 right-fluid-140-210 aspect-[170/121] w-fluid-118-170"
        />
        <PaperAsset
          name="blob-lavender-sleepy"
          className="-top-fluid-132-166 right-fluid-16-48 aspect-[160/100.4] w-fluid-112-160"
        />
      </div>
    </footer>
  );
}

function ContactRow(props: { icon: IconName; label: string; href: string; children: string }) {
  const { icon, label, href, children } = props;
  const external = !href.startsWith("/");
  const className = "flex h-11 items-center gap-3 transition-opacity hover:opacity-55";
  const content = (
    <>
      <Icon name={icon} className="text-primary-strong" />
      <span className="w-16 font-mono text-mono-m text-content-02">{label}</span>
      <span className="text-label-m text-content-01">{children}</span>
    </>
  );
  return (
    <li>
      {external ? (
        <a
          href={href}
          className={className}
          {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" })}
        >
          {content}
        </a>
      ) : (
        <Link href={href} className={className}>
          {content}
        </Link>
      )}
    </li>
  );
}

// 저작권 연도. Cache Components에서는 현재 시각을 캐시 안에서만 읽을 수 있다.
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

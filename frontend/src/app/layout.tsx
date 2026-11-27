import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_KR, Jua } from "next/font/google";
import "./globals.css";

// 한글 폰트는 Google Fonts가 unicode-range로 100여 개 파일로 나눈다. preload하면 전부 미리 받으므로 끄고,
// 브라우저가 화면에 쓰인 글자 구간의 파일만 받게 한다.
const jua = Jua({
  variable: "--font-jua",
  weight: "400",
  preload: false,
  display: "swap",
});

const plexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "유재혁.log",
  description: "백엔드 개발자 유재혁의 포트폴리오와 개발 블로그",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${jua.variable} ${plexSansKr.variable} ${plexMono.variable} h-full antialiased`}>
      <body id="top" className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}

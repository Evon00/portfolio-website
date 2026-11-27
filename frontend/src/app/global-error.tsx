"use client";

import "./globals.css";
import { Button } from "@/shared/components/button";
import { ErrorPage } from "@/shared/components/error-page";

// 루트 레이아웃까지 실패했을 때. 레이아웃을 대신하므로 <html>·<body>와 전역 스타일을 직접 둔다.
// 폰트 변수는 루트 레이아웃에만 있어 여기서는 기본 글꼴로 보인다.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ko">
      <body>
        <ErrorPage
          type="500"
          title="잠깐 문제가 생겼어요"
          description={
            <>
              서버에 연결하지 못했어요.
              <br />
              잠시 후 다시 시도해 주세요.
            </>
          }
          actions={
            <Button icon="refresh" onClick={() => retry()} className="min-w-40">
              다시 시도
            </Button>
          }
        />
      </body>
    </html>
  );
}

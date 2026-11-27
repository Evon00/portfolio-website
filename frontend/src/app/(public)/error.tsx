"use client";

import { Button } from "@/shared/components/button";
import { ErrorPage } from "@/shared/components/error-page";

// 500 서버·네트워크 오류. (public) 레이아웃 안에서 그려져 헤더·푸터는 그대로 남는다.
export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
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
        <>
          <Button icon="refresh" onClick={() => retry()} className="min-w-40">
            다시 시도
          </Button>
          <Button href="/" variant="outline" className="min-w-40">
            메인으로 가기
          </Button>
        </>
      }
    />
  );
}

import { NotFoundContent } from "@/shared/components/not-found-content";
import { SiteShell } from "@/app/_components/site-shell";

// 어떤 라우트에도 맞지 않는 주소. 루트 레이아웃만 감싸므로 헤더·푸터를 직접 그린다.
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}

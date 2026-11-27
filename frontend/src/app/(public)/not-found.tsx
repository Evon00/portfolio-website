import { NotFoundContent } from "@/shared/components/not-found-content";

// 상세 페이지의 notFound(). (public) 레이아웃 안이라 헤더·푸터가 함께 그려진다.
export default function SiteNotFound() {
  return <NotFoundContent />;
}

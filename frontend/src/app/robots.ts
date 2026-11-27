import type { MetadataRoute } from "next";

// 어드민은 검색에 노출하지 않는다(설계 문서 6절). 어드민 레이아웃의 noindex와 함께 쓴다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] },
  };
}

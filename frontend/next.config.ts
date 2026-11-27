import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // 이미지(최대 10MB)를 서버 액션으로 받아 Spring에 multipart로 넘기기 위한 본문 한도.
    // 기본값은 서버 액션 1MB, proxy 본문 버퍼 10MB다. multipart 경계·헤더 몫으로 1MB를 더 둔다.
    serverActions: { bodySizeLimit: "11mb" },
    proxyClientMaxBodySize: "11mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

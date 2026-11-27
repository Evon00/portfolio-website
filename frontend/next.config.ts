import type { NextConfig } from "next";

// 업로드 이미지(S3 + CloudFront) 주소. next/image는 이 주소 아래 이미지만 받는다(그 밖은 400).
const imageBaseUrl = process.env.IMAGE_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: imageBaseUrl ? [new URL(`${imageBaseUrl}/**`)] : [],
  },
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

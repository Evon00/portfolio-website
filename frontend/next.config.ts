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
    // 이미지를 서버 액션으로 받아 Spring에 multipart로 넘기기 위한 본문 한도(기본값: 서버 액션 1MB, proxy 본문 버퍼 10MB).
    // 프로젝트 저장은 갤러리 이미지(장당 10MB, 최대 10장)를 한 요청에 보내므로 Spring max-request-size(110MB)에 맞춘다.
    // 운영 nginx의 client_max_body_size도 이 값 이상이어야 한다.
    serverActions: { bodySizeLimit: "110mb" },
    proxyClientMaxBodySize: "110mb",
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

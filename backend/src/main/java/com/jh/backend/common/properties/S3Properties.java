package com.jh.backend.common.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/*
AWS S3 설정입니다.
 */
@ConfigurationProperties(prefix = "file.s3")
public record S3Properties(
        String bucket,
        String region,
        String publicUrl,      //  이미지 공개 주소 (CloudFront)  //
        String folder,         //  환경별 최상위 폴더 (dev, prod)  //
        String accessKey,      //  없으면 IAM 역할 사용  //
        String secretKey
) {
}

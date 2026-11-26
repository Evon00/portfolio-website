package com.jh.backend.config;

import com.jh.backend.common.properties.S3Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class S3Config {

    private final S3Properties s3Properties;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(s3Properties.region()))
                .credentialsProvider(credentialsProvider())
                .overrideConfiguration(config -> config.apiCallTimeout(Duration.ofSeconds(30)))
                .build();
    }

    /*
    인증 방식
    - 로컬 : .env의 액세스 키
    - 운영 : IAM 역할
     */
    private AwsCredentialsProvider credentialsProvider() {
        if (StringUtils.hasText(s3Properties.accessKey())) {
            return StaticCredentialsProvider.create(AwsBasicCredentials.create(s3Properties.accessKey(), s3Properties.secretKey()));
        }
        return DefaultCredentialsProvider.builder().build();
    }
}

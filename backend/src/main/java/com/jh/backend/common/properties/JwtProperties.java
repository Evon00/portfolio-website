package com.jh.backend.common.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/*
JWT를 사용하기 위한 설정입니다.
- secret : Base64로 인코딩한 비밀 키
 */
@Validated
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        @NotBlank String secret,
        @NotNull Duration accessTokenExpiry,
        @NotNull Duration refreshTokenExpiry
) {
}

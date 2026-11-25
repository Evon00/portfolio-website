package com.jh.backend.common.properties;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/*
Refresh Token 쿠키 설정입니다.
 */
@Validated
@ConfigurationProperties(prefix = "cookie")
public record CookieProperties(
        @NotBlank String path,          //  유효한 경로 설정  //
        @NotBlank String sameSite,      //  다른 사이트 쿠키 포함 여부 설정  //
        boolean secure                  //  HTTPS 설정  //
) {
}

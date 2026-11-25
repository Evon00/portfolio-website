package com.jh.backend.common.properties;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/*
CORS를 허용할 프론트엔드 주소 설정입니다.
 */
@Validated
@ConfigurationProperties(prefix = "cors")
public record CorsProperties(
        @NotEmpty List<String> allowedOrigins
) {
}

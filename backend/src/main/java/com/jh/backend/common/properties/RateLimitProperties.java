package com.jh.backend.common.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/*
IP별 요청 횟수 제한 설정입니다.
- rules : 규칙명 → 규칙
 */
@Validated
@ConfigurationProperties(prefix = "rate-limit")
public record RateLimitProperties(
        @NotEmpty Map<String, @Valid Rule> rules
) {

    public record Rule(
            @NotEmpty List<String> paths,      //  적용할 API 경로 (쉼표 구분)  //
            @Positive int maxRequests,         //  시간 내 최대 요청 수  //
            @NotNull Duration window,          //  제한 시간  //
            boolean failOpen                   //  Redis 장애시 통과 여부  //
    ) {
    }
}

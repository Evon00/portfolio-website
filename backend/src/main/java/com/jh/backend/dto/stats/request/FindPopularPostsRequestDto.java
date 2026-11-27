package com.jh.backend.dto.stats.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record FindPopularPostsRequestDto(

        @Min(value = 1, message = "조회 개수는 1 이상이어야 합니다.")
        @Max(value = 20, message = "조회 개수는 최대 20까지 가능합니다.")
        @Schema(description = "조회 개수 (1~20, 기본 5)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "5")
        Integer limit
) {
}

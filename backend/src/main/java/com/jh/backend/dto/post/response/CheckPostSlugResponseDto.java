package com.jh.backend.dto.post.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record CheckPostSlugResponseDto(

        @Schema(description = "확인한 슬러그", example = "redis-setifabsent-lock")
        String postSlug,

        @Schema(description = "사용 가능 여부 (같은 슬러그의 게시글이 없으면 true)", example = "true")
        boolean available
) {
}

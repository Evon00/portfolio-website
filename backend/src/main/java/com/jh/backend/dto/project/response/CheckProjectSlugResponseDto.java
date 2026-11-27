package com.jh.backend.dto.project.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record CheckProjectSlugResponseDto(

        @Schema(description = "확인한 슬러그", example = "knu-robotics")
        String projectSlug,

        @Schema(description = "사용 가능 여부 (같은 슬러그의 프로젝트가 없으면 true)", example = "true")
        boolean available
) {
}

package com.jh.backend.dto.project.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record FindAllProjectsRequestDto(

        @Min(value = 0, message = "페이지 번호는 0 이상이어야 합니다.")
        @Schema(description = "페이지 번호 (0부터, 기본 0)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "0")
        Integer pageNumber,

        @Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다.")
        @Max(value = 50, message = "페이지 크기는 최대 50까지 가능합니다.")
        @Schema(description = "페이지 크기 (1~50, 기본 6)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "6")
        Integer pageSize
) {
}

package com.jh.backend.dto.project.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateProjectPriorityRequestDto(

        @NotNull(message = "프로젝트 순서는 필수값입니다.")
        @Min(value = 1, message = "프로젝트 순서는 1 이상이어야 합니다.")
        @Schema(description = "이동할 위치 (1부터, 전체 목록 기준, 프로젝트 수 이하)", requiredMode = Schema.RequiredMode.REQUIRED, example = "2")
        Integer projectPriority
) {
}

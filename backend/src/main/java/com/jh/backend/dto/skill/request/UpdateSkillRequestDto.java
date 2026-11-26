package com.jh.backend.dto.skill.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateSkillRequestDto(

        @NotBlank(message = "기술 스택 이름은 필수값입니다.")
        @Size(max = 100, message = "기술 스택 이름은 최대 100자까지 입력 가능합니다.")
        @Schema(description = "기술 스택 이름", requiredMode = Schema.RequiredMode.REQUIRED, example = "Apache Kafka")
        String skillName,

        @NotBlank(message = "기술 스택 카테고리는 필수값입니다.")
        @Size(max = 100, message = "기술 스택 카테고리는 최대 100자까지 입력 가능합니다.")
        @Schema(description = "기술 스택 카테고리", requiredMode = Schema.RequiredMode.REQUIRED, example = "Backend")
        String skillCategory
) {
}

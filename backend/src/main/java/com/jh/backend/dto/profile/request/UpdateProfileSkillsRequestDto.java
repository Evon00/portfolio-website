package com.jh.backend.dto.profile.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateProfileSkillsRequestDto(

        @NotNull(message = "핵심 기술 스택 목록은 필수값입니다.")
        @Size(max = 20, message = "핵심 기술 스택은 최대 20개까지 등록 가능합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "핵심 기술 스택 PK 목록 (배열 순서 = 노출 순서, 빈 배열이면 비우기)", requiredMode = Schema.RequiredMode.REQUIRED),
                schema = @Schema(description = "기술 스택 PK", example = "2"))
        List<@NotNull(message = "기술 스택 PK는 필수값입니다.") @Positive(message = "기술 스택 PK는 0보다 큰 양수여야 합니다.") Long> skillIds
) {
}

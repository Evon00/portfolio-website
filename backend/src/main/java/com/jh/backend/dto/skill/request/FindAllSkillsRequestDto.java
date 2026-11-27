package com.jh.backend.dto.skill.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

public record FindAllSkillsRequestDto(

        @Size(max = 100, message = "기술 스택 카테고리는 최대 100자까지 입력 가능합니다.")
        @Schema(description = "카테고리 필터 (정확히 일치, 없으면 전체)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "Backend")
        String skillCategory,

        @Size(max = 100, message = "검색어는 최대 100자까지 입력 가능합니다.")
        @Schema(description = "이름 검색어 (부분 일치, 대소문자 무시)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "spring")
        String keyword
) {
}

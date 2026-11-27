package com.jh.backend.dto.skill.response;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record FindAllSkillCategoriesResponseDto(

        @ArraySchema(
                arraySchema = @Schema(description = "기술 스택 카테고리 목록 (중복 제거, 알파벳 오름차순)"),
                schema = @Schema(example = "Backend")
        )
        List<String> skillCategories
) {
}

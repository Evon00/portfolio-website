package com.jh.backend.dto.stats.item;

import io.swagger.v3.oas.annotations.media.Schema;

// 기술 스택 비율 항목 (상위 limit개)
public record SkillStatsItem(

        @Schema(description = "기술 스택 PK", example = "2")
        Long skillId,

        @Schema(description = "기술 스택 이름", example = "Spring Boot")
        String skillName,

        @Schema(description = "사용 수", example = "3")
        long count,

        @Schema(description = "비율 (정수 퍼센트)", example = "15")
        int ratio
) {
}

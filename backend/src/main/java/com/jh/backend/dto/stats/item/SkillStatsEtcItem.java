package com.jh.backend.dto.stats.item;

import io.swagger.v3.oas.annotations.media.Schema;

// 기술 스택 비율 기타 (상위 limit개를 제외한 나머지 합계, 없으면 0)
public record SkillStatsEtcItem(

        @Schema(description = "사용 수", example = "7")
        long count,

        @Schema(description = "비율 (정수 퍼센트)", example = "35")
        int ratio
) {
}

package com.jh.backend.dto.stats.request;

import com.jh.backend.common.enums.StatsSkillType;
import com.jh.backend.util.validator.enums.ValidEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record FindSkillStatsRequestDto(

        @ValidEnum(enumClass = StatsSkillType.class, message = "집계 대상은 POST, PROJECT 중 하나여야 합니다.")
        @Schema(description = "집계 대상 (블로그 / 프로젝트)", requiredMode = Schema.RequiredMode.REQUIRED, allowableValues = {"POST", "PROJECT"}, example = "POST")
        String type,

        @Min(value = 1, message = "상위 개수는 1 이상이어야 합니다.")
        @Max(value = 20, message = "상위 개수는 최대 20까지 가능합니다.")
        @Schema(description = "상위 개수 (1~20, 기본 5, 나머지는 기타)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "5")
        Integer limit
) {
}

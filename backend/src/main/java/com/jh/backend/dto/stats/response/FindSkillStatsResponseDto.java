package com.jh.backend.dto.stats.response;

import com.jh.backend.dto.stats.item.SkillStatsEtcItem;
import com.jh.backend.dto.stats.item.SkillStatsItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record FindSkillStatsResponseDto(

        @Schema(description = "집계 대상", example = "POST")
        String type,

        @Schema(description = "전체 태그 수 (도넛 가운데 숫자)", example = "20")
        long totalCount,

        @Schema(description = "상위 기술 스택 (사용 수 내림차순)")
        List<SkillStatsItem> items,

        @Schema(description = "기타 (나머지가 없으면 count 0, ratio 0)")
        SkillStatsEtcItem etc
) {
}

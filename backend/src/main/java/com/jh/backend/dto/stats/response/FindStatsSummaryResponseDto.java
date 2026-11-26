package com.jh.backend.dto.stats.response;

import io.swagger.v3.oas.annotations.media.Schema;

// 대시보드 상단 카드 4개 수치
public record FindStatsSummaryResponseDto(

        @Schema(description = "전체 게시글 수 (삭제 제외)", example = "6")
        long totalPosts,

        @Schema(description = "전체 프로젝트 수 (삭제 제외)", example = "8")
        long totalProjects,

        @Schema(description = "전체 조회수 (삭제된 게시글 제외)", example = "5242")
        long totalViews,

        @Schema(description = "게시글당 평균 조회수 (반올림, 게시글이 없으면 0)", example = "874")
        long avgViews
) {
}

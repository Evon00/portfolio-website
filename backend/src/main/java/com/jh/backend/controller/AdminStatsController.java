package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.stats.request.FindPopularPostsRequestDto;
import com.jh.backend.dto.stats.request.FindSkillStatsRequestDto;
import com.jh.backend.dto.stats.response.FindPopularPostsResponseDto;
import com.jh.backend.dto.stats.response.FindSkillStatsResponseDto;
import com.jh.backend.dto.stats.response.FindStatsSummaryResponseDto;
import com.jh.backend.service.AdminStatsService;
import com.jh.backend.swagger.stats.FindPopularPostsSwaggerDocs;
import com.jh.backend.swagger.stats.FindSkillStatsSwaggerDocs;
import com.jh.backend.swagger.stats.FindStatsSummarySwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "관리자 통계", description = "관리자 대시보드 통계 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    // 통계 요약 (대시보드)
    @FindStatsSummarySwaggerDocs
    @GetMapping("/summary")
    public ResponseEntity<CommonApiResponse<FindStatsSummaryResponseDto>> findStatsSummary() {
        return ResponseEntity.ok(CommonApiResponse.ok(adminStatsService.findStatsSummary()));
    }

    // 인기 게시글 통계
    @FindPopularPostsSwaggerDocs
    @GetMapping("/post/popular")
    public ResponseEntity<CommonApiResponse<FindPopularPostsResponseDto>> findPopularPosts(
            @Valid @ParameterObject FindPopularPostsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminStatsService.findPopularPosts(dto)));
    }

    // 기술 스택 비율 통계
    @FindSkillStatsSwaggerDocs
    @GetMapping("/skill")
    public ResponseEntity<CommonApiResponse<FindSkillStatsResponseDto>> findSkillStats(
            @Valid @ParameterObject FindSkillStatsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminStatsService.findSkillStats(dto)));
    }
}

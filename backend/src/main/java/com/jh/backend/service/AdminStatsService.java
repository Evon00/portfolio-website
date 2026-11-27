package com.jh.backend.service;

import com.jh.backend.dto.stats.request.FindPopularPostsRequestDto;
import com.jh.backend.dto.stats.request.FindSkillStatsRequestDto;
import com.jh.backend.dto.stats.response.FindPopularPostsResponseDto;
import com.jh.backend.dto.stats.response.FindSkillStatsResponseDto;
import com.jh.backend.dto.stats.response.FindStatsSummaryResponseDto;

public interface AdminStatsService {

    // 통계 요약 (대시보드)
    FindStatsSummaryResponseDto findStatsSummary();

    // 인기 게시글 통계
    FindPopularPostsResponseDto findPopularPosts(FindPopularPostsRequestDto dto);

    // 기술 스택 비율 통계
    FindSkillStatsResponseDto findSkillStats(FindSkillStatsRequestDto dto);
}

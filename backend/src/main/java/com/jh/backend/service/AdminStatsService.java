package com.jh.backend.service;

import com.jh.backend.dto.stats.response.FindStatsSummaryResponseDto;

public interface AdminStatsService {

    // 통계 요약 (대시보드)
    FindStatsSummaryResponseDto findStatsSummary();
}

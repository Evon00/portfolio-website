package com.jh.backend.service.implement;

import com.jh.backend.dto.stats.response.FindStatsSummaryResponseDto;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.repository.ProjectRepository;
import com.jh.backend.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;

    // 통계 요약 (대시보드 상단 카드 4개)
    //      -> 관리자 인증은 Security 필터에서 처리
    @Override
    @Transactional(readOnly = true)
    public FindStatsSummaryResponseDto findStatsSummary() {

        // 1. 게시글 수 조회
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        long totalPosts = postRepository.count();

        // 2. 프로젝트 수 조회
        //      -> 삭제된 프로젝트 제외 (@SQLRestriction)
        long totalProjects = projectRepository.count();

        // 3. 전체 조회수 조회 (게시글 view 합계, 쿼리 1번)
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        //      -> 게시글이 없으면 0 (COALESCE)
        long totalViews = postRepository.sumView();

        // 4. 평균 조회수 계산
        //      -> totalViews / totalPosts 반올림
        //      -> 게시글이 없으면 0 (0으로 나누기 방지)
        long avgViews = totalPosts == 0 ? 0 : Math.round(totalViews / (double) totalPosts);

        // 5. 응답 DTO로 변환
        return new FindStatsSummaryResponseDto(totalPosts, totalProjects, totalViews, avgViews);
    }
}

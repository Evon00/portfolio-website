package com.jh.backend.service.implement;

import com.jh.backend.dto.stats.item.PopularPostItem;
import com.jh.backend.dto.stats.request.FindPopularPostsRequestDto;
import com.jh.backend.dto.stats.response.FindPopularPostsResponseDto;
import com.jh.backend.dto.stats.response.FindStatsSummaryResponseDto;
import com.jh.backend.entity.Post;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.repository.ProjectRepository;
import com.jh.backend.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private static final int DEFAULT_POPULAR_POST_LIMIT = 5;

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

    // 인기 게시글 통계 (조회수 기준 상위 게시글)
    //      -> 관리자 인증은 Security 필터에서 처리
    @Override
    @Transactional(readOnly = true)
    public FindPopularPostsResponseDto findPopularPosts(FindPopularPostsRequestDto dto) {

        // 1. 조회 조건 정리
        //      -> limit 기본값 5 (범위 1~20은 DTO에서 검증)
        //      -> 조회수 내림차순, 같으면 PK 내림차순 (최신 글 먼저)
        PageRequest pageRequest = PageRequest.of(0,
                dto.limit() != null ? dto.limit() : DEFAULT_POPULAR_POST_LIMIT,
                Sort.by(Sort.Order.desc("view"), Sort.Order.desc("id")));

        // 2. 게시글 조회 (LIMIT 쿼리 1번, count 쿼리 없음)
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        //      -> 조회수 0인 게시글 포함, 게시글이 limit보다 적으면 있는 만큼
        List<Post> posts = postRepository.findAllBy(pageRequest);

        // 3. 응답 DTO로 변환
        //      -> rank는 정렬 순서대로 1부터 (동점도 다른 순위)
        return new FindPopularPostsResponseDto(IntStream.range(0, posts.size())
                .mapToObj(i -> PopularPostItem.fromEntity(i + 1, posts.get(i)))
                .toList());
    }
}

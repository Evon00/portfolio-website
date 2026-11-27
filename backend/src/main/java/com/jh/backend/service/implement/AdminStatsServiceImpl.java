package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StatsSkillType;
import com.jh.backend.dto.stats.item.PopularPostItem;
import com.jh.backend.dto.stats.item.SkillStatsEtcItem;
import com.jh.backend.dto.stats.item.SkillStatsItem;
import com.jh.backend.dto.stats.request.FindPopularPostsRequestDto;
import com.jh.backend.dto.stats.request.FindSkillStatsRequestDto;
import com.jh.backend.dto.stats.response.FindPopularPostsResponseDto;
import com.jh.backend.dto.stats.response.FindSkillStatsResponseDto;
import com.jh.backend.dto.stats.response.FindStatsSummaryResponseDto;
import com.jh.backend.entity.Post;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.repository.PostSkillRepository;
import com.jh.backend.repository.ProjectRepository;
import com.jh.backend.repository.ProjectSkillRepository;
import com.jh.backend.repository.projection.SkillUsageCount;
import com.jh.backend.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {

    private static final int DEFAULT_POPULAR_POST_LIMIT = 5;
    private static final int DEFAULT_SKILL_STATS_LIMIT = 5;

    private final PostRepository postRepository;
    private final ProjectRepository projectRepository;
    private final PostSkillRepository postSkillRepository;
    private final ProjectSkillRepository projectSkillRepository;

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

    // 기술 스택 비율 통계 (도넛 차트)
    //      -> 관리자 인증은 Security 필터에서 처리
    @Override
    @Transactional(readOnly = true)
    public FindSkillStatsResponseDto findSkillStats(FindSkillStatsRequestDto dto) {

        // 1. 조회 조건 정리
        //      -> type은 DTO에서 검증 (POST, PROJECT)
        //      -> limit 기본값 5 (범위 1~20은 DTO에서 검증)
        StatsSkillType type = StatsSkillType.valueOf(dto.type());
        int limit = dto.limit() != null ? dto.limit() : DEFAULT_SKILL_STATS_LIMIT;

        // 2. 기술 스택별 사용 수 조회 (GROUP BY 쿼리 1번)
        //      -> POST : 게시글 태그, PROJECT : 프로젝트 기술 스택
        //      -> 삭제된 게시글, 프로젝트 제외
        //      -> 사용 수 내림차순, 같으면 skillId 오름차순
        List<SkillUsageCount> usages = type == StatsSkillType.POST
                ? postSkillRepository.countAllGroupBySkill()
                : projectSkillRepository.countAllGroupBySkill();

        // 3. 전체 태그 수 계산 (모든 사용 수 합계)
        long totalCount = usages.stream().mapToLong(SkillUsageCount::getUsageCount).sum();

        // 4. 상위 limit개와 기타 나누기
        //      -> 기타 사용 수 = 나머지 기술 스택 사용 수 합계 (없으면 0)
        List<SkillUsageCount> topUsages = usages.subList(0, Math.min(limit, usages.size()));
        long etcCount = usages.subList(topUsages.size(), usages.size()).stream()
                .mapToLong(SkillUsageCount::getUsageCount).sum();

        // 5. 비율 계산 (상위 limit개 + 기타, calculateRatios)
        //      -> 최대 나머지 방식으로 합계가 정확히 100
        //      -> 전체 태그 수가 0이면 모두 0
        List<Long> counts = new ArrayList<>(topUsages.stream().map(SkillUsageCount::getUsageCount).toList());
        counts.add(etcCount);
        int[] ratios = calculateRatios(counts, totalCount);

        // 6. 응답 DTO로 변환
        //      -> 태그가 없으면 items 빈 목록, etc는 count 0, ratio 0
        List<SkillStatsItem> items = IntStream.range(0, topUsages.size())
                .mapToObj(i -> new SkillStatsItem(topUsages.get(i).getSkillId(), topUsages.get(i).getSkillName(),
                        topUsages.get(i).getUsageCount(), ratios[i]))
                .toList();
        return new FindSkillStatsResponseDto(type.name(), totalCount, items,
                new SkillStatsEtcItem(etcCount, ratios[topUsages.size()]));
    }

    // 사용 수 목록을 정수 퍼센트로 변환 (최대 나머지 방식)
    //      -> 각 비율을 버림한 뒤, 100에서 모자란 만큼 소수점이 큰 항목부터 1씩 더함
    //      -> 소수점이 같으면 앞 항목(사용 수가 많은 쪽) 먼저
    //      -> 전체가 0이면 모두 0
    private int[] calculateRatios(List<Long> counts, long totalCount) {
        int[] ratios = new int[counts.size()];
        if (totalCount == 0) {
            return ratios;
        }

        // 버림한 비율과 나머지 (나머지는 totalCount 단위로 비교해 소수 오차 없음)
        long[] remainders = new long[counts.size()];
        int sum = 0;
        for (int i = 0; i < counts.size(); i++) {
            long scaled = counts.get(i) * 100;
            ratios[i] = (int) (scaled / totalCount);
            remainders[i] = scaled % totalCount;
            sum += ratios[i];
        }

        // 모자란 만큼 나머지가 큰 항목부터 1씩 (같으면 앞 항목 먼저, 정렬이 안정적)
        List<Integer> order = IntStream.range(0, counts.size()).boxed()
                .sorted(Comparator.comparingLong((Integer i) -> remainders[i]).reversed())
                .toList();
        for (int k = 0; k < 100 - sum; k++) {
            ratios[order.get(k)]++;
        }
        return ratios;
    }
}

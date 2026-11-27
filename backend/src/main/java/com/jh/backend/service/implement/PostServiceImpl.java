package com.jh.backend.service.implement;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllPostsItem;
import com.jh.backend.dto.post.item.PostSkillItem;
import com.jh.backend.dto.post.request.FindAllPostsRequestDto;
import com.jh.backend.dto.post.response.FindPostBySlugResponseDto;
import com.jh.backend.entity.Post;
import com.jh.backend.entity.PostViewLog;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.repository.PostSkillRepository;
import com.jh.backend.repository.PostViewLogRepository;
import com.jh.backend.service.PostService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.post.PostReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private static final int MAX_USER_AGENT_LENGTH = 500;
    private static final String UNKNOWN_USER_AGENT = "unknown";
    private static final long VIEW_DEDUPLICATION_HOURS = 24;

    private final PostRepository postRepository;
    private final PostSkillRepository postSkillRepository;
    private final PostViewLogRepository postViewLogRepository;
    private final PostReader postReader;
    private final FileUtil fileUtil;

    // 공개 게시글 목록 조회 (인증 불필요)
    //      -> 조회수 증가, 조회 로그 기록 없음 (조회수는 슬러그 상세 조회에서만 증가)
    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<FindAllPostsItem> findAllPosts(FindAllPostsRequestDto dto) {

        // 1. 게시글 페이지 조회 (PostReader, 관리자 목록과 같은 조건)
        //      -> 기본값 : pageNumber 0, pageSize 10, sortBy createdAt, sortDir desc
        //      -> 검색어만 있으면 제목+내용(TITLE_CONTENT)으로 검색, 대소문자 무시 부분 일치
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        Page<Post> posts = postReader.readPage(dto.pageNumber(), dto.pageSize(), dto.sortBy(), dto.sortDir(),
                dto.keywordType(), dto.keyword());

        // 2. 게시글 기술 스택 조회 (PostReader, IN 쿼리 1번)
        //      -> 게시글별 priority 오름차순
        Map<Long, List<PostSkillItem>> skillsByPostId = postReader.readSkillsByPostId(posts);

        // 3. 응답 DTO로 변환
        //      -> 본문(postContent)은 응답하지 않음
        //      -> postThumbnailUrl은 썸네일 s3 key를 공개 주소로 변환 (없으면 null)
        //      -> 범위를 넘은 페이지는 빈 목록
        return PageResponseDto.of(posts, posts.stream()
                .map(post -> FindAllPostsItem.fromEntity(post, fileUtil.toUrl(post.getThumbnailS3Key()),
                        skillsByPostId.getOrDefault(post.getId(), List.of())))
                .toList());
    }

    // 게시글 상세 조회 (슬러그, 인증 불필요)
    //      -> 슬러그 형식 검증 없음 (형식이 틀리면 게시글이 없으므로 404)
    //      -> clientIp, userAgent는 컨트롤러에서 추출 (IpUtils.getClientIp, User-Agent 헤더)
    @Override
    @Transactional
    public FindPostBySlugResponseDto findPostBySlug(String postSlug, String clientIp, String userAgent) {

        // 1. 게시글 조회
        //      -> 삭제된 게시글 제외 (@SQLRestriction)
        //      exc. 게시글 미존재 또는 삭제된 경우 에러 처리 (POST_NOT_FOUND, 404)
        Post post = postRepository.findBySlug(postSlug).orElseThrow(
                () -> new CustomException(ExceptionCode.POST_NOT_FOUND));

        // 2. 같은 IP의 24시간 내 조회 기록 확인
        //      -> clientIp를 InetAddress로 변환 (IP 문자열이라 DNS 조회 없음)
        //      -> existsByPostIdAndIpAddressAndCreatedAtAfter(postId, ip, 현재 - 24시간)
        InetAddress ipAddress = toInetAddress(clientIp);
        boolean viewed = postViewLogRepository.existsByPostIdAndIpAddressAndCreatedAtAfter(
                post.getId(), ipAddress, OffsetDateTime.now().minusHours(VIEW_DEDUPLICATION_HOURS));

        // 3. 조회 기록이 없으면 조회수 증가 + 조회 로그 기록
        //      -> PostRepository.increaseView (UPDATE 쿼리, modified_at 미갱신)
        //      -> PostViewLog 저장 (IP, User-Agent)
        //          -> User-Agent가 없거나 비어 있으면 "unknown", 500자 초과시 자름
        //      -> 조회 기록이 있으면 조회수, 로그 모두 변경 없음
        //      -> 같은 IP 동시 요청은 중복 증가될 수 있음 (허용)
        if (!viewed) {
            postRepository.increaseView(post.getId());
            postViewLogRepository.save(PostViewLog.builder()
                    .post(post)
                    .ipAddress(ipAddress)
                    .userAgent(normalizeUserAgent(userAgent))
                    .build());
        }

        // 4. 게시글 기술 스택 조회 (findAllByPostIdIn, priority 오름차순)
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        List<PostSkillItem> skills = postSkillRepository.findAllByPostIdIn(List.of(post.getId())).stream()
                .map(postSkill -> PostSkillItem.fromEntity(postSkill, fileUtil.toUrl(postSkill.getSkill().getS3Key())))
                .toList();

        // 5. 응답 DTO로 변환
        //      -> postView는 증가한 경우 조회한 값 + 1 (엔티티 재조회 없음)
        //      -> postThumbnailUrl은 썸네일 s3 key를 공개 주소로 변환 (없으면 null)
        //      -> 본문은 저장된 원문 그대로 응답
        return FindPostBySlugResponseDto.fromEntity(post, viewed ? post.getView() : post.getView() + 1,
                fileUtil.toUrl(post.getThumbnailS3Key()), skills);
    }

    // IP 문자열을 InetAddress로 변환 (IP 문자열이라 DNS 조회 없음, 변환 실패시 0.0.0.0)
    private InetAddress toInetAddress(String clientIp) {
        try {
            return InetAddress.getByName(clientIp);
        } catch (UnknownHostException e) {
            log.warn("클라이언트 IP 변환 실패 - clientIp = {}", clientIp);
            return new InetSocketAddress(0).getAddress();
        }
    }

    // User-Agent 정리 (없거나 비어 있으면 unknown, 500자 초과시 자름)
    private String normalizeUserAgent(String userAgent) {
        if (!StringUtils.hasText(userAgent)) return UNKNOWN_USER_AGENT;
        String value = userAgent.strip();
        return value.length() <= MAX_USER_AGENT_LENGTH ? value : value.substring(0, MAX_USER_AGENT_LENGTH);
    }
}

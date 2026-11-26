package com.jh.backend.util.post;

import com.jh.backend.common.enums.PostKeywordType;
import com.jh.backend.common.enums.PostSortBy;
import com.jh.backend.common.enums.SortDirection;
import com.jh.backend.dto.post.item.PostSkillItem;
import com.jh.backend.entity.Post;
import com.jh.backend.repository.PostRepository;
import com.jh.backend.repository.PostSkillRepository;
import com.jh.backend.util.file.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/*
게시글 목록 조회
- 관리자 게시글 목록, 공개 게시글 목록에서 같은 페이지·정렬·검색 조건을 사용합니다.
 */
@Component
@RequiredArgsConstructor
public class PostReader {

    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final int DEFAULT_PAGE_SIZE = 10;

    private final PostRepository postRepository;
    private final PostSkillRepository postSkillRepository;
    private final FileUtil fileUtil;

    // 게시글 페이지 조회 (JPQL, count 쿼리 포함)
    //      -> 기본값 : pageNumber 0, pageSize 10, sortBy createdAt, sortDir desc
    //      -> createdAt은 등록일, postView는 조회수 기준
    //      -> 값이 같으면 PK를 같은 방향으로 정렬 (페이지 이동시 순서 고정)
    //      -> 검색어는 앞뒤 공백 제거 후 비어 있으면 검색 안 함
    //      -> 검색 종류 없이 검색어만 있으면 제목+내용(TITLE_CONTENT)으로 검색
    //      -> 대소문자 무시 부분 일치, %, _, \ 는 글자 그대로 검색되도록 escape 처리
    //      -> 삭제된 게시글 제외 (@SQLRestriction)
    //      -> SKILL 검색은 EXISTS 서브쿼리로 기술 스택 이름 비교 (게시글 중복 방지)
    public Page<Post> readPage(Integer pageNumber, Integer pageSize, String sortBy, String sortDir,
                               String keywordType, String keyword) {
        PostSortBy postSortBy = sortBy != null ? PostSortBy.valueOf(sortBy) : PostSortBy.createdAt;
        Sort.Direction direction = (sortDir != null ? SortDirection.valueOf(sortDir) : SortDirection.desc).getDirection();
        PageRequest pageRequest = PageRequest.of(
                pageNumber != null ? pageNumber : DEFAULT_PAGE_NUMBER,
                pageSize != null ? pageSize : DEFAULT_PAGE_SIZE,
                Sort.by(direction, postSortBy.getProperty()).and(Sort.by(direction, "id")));

        String type = null;
        String pattern = null;
        if (StringUtils.hasText(keyword)) {
            type = keywordType != null ? keywordType : PostKeywordType.TITLE_CONTENT.name();
            pattern = "%" + escapeLike(keyword.strip().toLowerCase(Locale.ROOT)) + "%";
        }

        return postRepository.findAllBySearch(type, pattern, pageRequest);
    }

    // 게시글별 기술 스택 조회 (IN 쿼리 1번, N+1 방지)
    //      -> 조회된 게시글이 없으면 생략
    //      -> 게시글별 priority 오름차순
    //      -> skillUrl은 s3 key를 공개 주소로 변환
    public Map<Long, List<PostSkillItem>> readSkillsByPostId(Page<Post> posts) {
        if (posts.isEmpty()) return Map.of();
        return postSkillRepository.findAllByPostIdIn(posts.map(Post::getId).toList()).stream()
                .collect(Collectors.groupingBy(postSkill -> postSkill.getPost().getId(),
                        Collectors.mapping(postSkill -> PostSkillItem.fromEntity(postSkill, fileUtil.toUrl(postSkill.getSkill().getS3Key())),
                                Collectors.toList())));
    }

    // LIKE 검색어 escape (\, %, _ 를 글자 그대로 검색)
    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}

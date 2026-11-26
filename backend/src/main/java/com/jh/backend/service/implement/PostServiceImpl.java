package com.jh.backend.service.implement;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllPostsItem;
import com.jh.backend.dto.post.item.PostSkillItem;
import com.jh.backend.dto.post.request.FindAllPostsRequestDto;
import com.jh.backend.entity.Post;
import com.jh.backend.service.PostService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.post.PostReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

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
}

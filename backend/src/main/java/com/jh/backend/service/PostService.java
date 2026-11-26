package com.jh.backend.service;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllPostsItem;
import com.jh.backend.dto.post.request.FindAllPostsRequestDto;

public interface PostService {

    // 공개 게시글 목록 조회
    PageResponseDto<FindAllPostsItem> findAllPosts(FindAllPostsRequestDto dto);
}

package com.jh.backend.service;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllPostsItem;
import com.jh.backend.dto.post.request.FindAllPostsRequestDto;
import com.jh.backend.dto.post.response.FindPostBySlugResponseDto;

public interface PostService {

    // 공개 게시글 목록 조회
    PageResponseDto<FindAllPostsItem> findAllPosts(FindAllPostsRequestDto dto);

    // 게시글 상세 조회 (슬러그)
    FindPostBySlugResponseDto findPostBySlug(String postSlug, String clientIp, String userAgent);
}

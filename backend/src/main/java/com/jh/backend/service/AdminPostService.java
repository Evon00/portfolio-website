package com.jh.backend.service;

import com.jh.backend.dto.post.request.CheckPostSlugRequestDto;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllAdminPostsItem;
import com.jh.backend.dto.post.request.CreatePostRequestDto;
import com.jh.backend.dto.post.request.FindAllAdminPostsRequestDto;
import com.jh.backend.dto.post.response.CheckPostSlugResponseDto;
import com.jh.backend.dto.post.response.CreatePostResponseDto;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AdminPostService {

    // 게시글 이미지 업로드
    UploadPostImageResponseDto uploadPostImage(MultipartFile file);

    // 게시글 슬러그 중복 확인
    CheckPostSlugResponseDto checkPostSlug(CheckPostSlugRequestDto dto);

    // 게시글 추가
    CreatePostResponseDto createPost(CreatePostRequestDto dto);

    // 관리자 게시글 목록 조회
    PageResponseDto<FindAllAdminPostsItem> findAllAdminPosts(FindAllAdminPostsRequestDto dto);
}

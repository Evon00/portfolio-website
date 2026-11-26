package com.jh.backend.service;

import com.jh.backend.dto.post.request.CheckPostSlugRequestDto;
import com.jh.backend.dto.post.response.CheckPostSlugResponseDto;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AdminPostService {

    // 게시글 이미지 업로드
    UploadPostImageResponseDto uploadPostImage(MultipartFile file);

    // 게시글 슬러그 중복 확인
    CheckPostSlugResponseDto checkPostSlug(CheckPostSlugRequestDto dto);
}

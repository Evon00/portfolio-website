package com.jh.backend.service;

import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AdminPostService {

    // 게시글 이미지 업로드
    UploadPostImageResponseDto uploadPostImage(MultipartFile file);
}

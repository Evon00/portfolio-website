package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import com.jh.backend.service.AdminPostService;
import com.jh.backend.swagger.post.UploadPostImageSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "관리자 게시글", description = "관리자용 게시글 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/admin/post")
@RequiredArgsConstructor
public class AdminPostController {

    private final AdminPostService adminPostService;

    // 게시글 이미지 업로드
    @UploadPostImageSwaggerDocs
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<UploadPostImageResponseDto>> uploadPostImage(
            @RequestPart MultipartFile file) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminPostService.uploadPostImage(file)));
    }
}

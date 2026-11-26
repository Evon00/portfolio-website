package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllAdminPostsItem;
import com.jh.backend.dto.post.request.CheckPostSlugRequestDto;
import com.jh.backend.dto.post.request.CreatePostRequestDto;
import com.jh.backend.dto.post.request.FindAllAdminPostsRequestDto;
import com.jh.backend.dto.post.response.CheckPostSlugResponseDto;
import com.jh.backend.dto.post.response.CreatePostResponseDto;
import com.jh.backend.dto.post.response.FindPostResponseDto;
import com.jh.backend.dto.post.response.UploadPostImageResponseDto;
import com.jh.backend.service.AdminPostService;
import com.jh.backend.swagger.post.CheckPostSlugSwaggerDocs;
import com.jh.backend.swagger.post.CreatePostSwaggerDocs;
import com.jh.backend.swagger.post.FindAllAdminPostsSwaggerDocs;
import com.jh.backend.swagger.post.FindPostSwaggerDocs;
import com.jh.backend.swagger.post.UploadPostImageSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    // 게시글 슬러그 중복 확인
    @CheckPostSlugSwaggerDocs
    @GetMapping("/slug/check")
    public ResponseEntity<CommonApiResponse<CheckPostSlugResponseDto>> checkPostSlug(
            @Valid @ParameterObject CheckPostSlugRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminPostService.checkPostSlug(dto)));
    }

    // 게시글 추가
    @CreatePostSwaggerDocs
    @PostMapping
    public ResponseEntity<CommonApiResponse<CreatePostResponseDto>> createPost(
            @Valid @RequestBody CreatePostRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminPostService.createPost(dto)));
    }

    // 관리자 게시글 목록 조회
    @FindAllAdminPostsSwaggerDocs
    @GetMapping
    public ResponseEntity<CommonApiResponse<PageResponseDto<FindAllAdminPostsItem>>> findAllAdminPosts(
            @Valid @ParameterObject FindAllAdminPostsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminPostService.findAllAdminPosts(dto)));
    }

    // 게시글 상세 조회 (수정용)
    @FindPostSwaggerDocs
    @GetMapping("/{postId}")
    public ResponseEntity<CommonApiResponse<FindPostResponseDto>> findPost(
            @Positive(message = "게시글 PK는 0보다 큰 양수여야 합니다.")
            @PathVariable Long postId) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminPostService.findPost(postId)));
    }
}

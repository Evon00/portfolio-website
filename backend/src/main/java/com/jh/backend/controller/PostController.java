package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.post.item.FindAllPostsItem;
import com.jh.backend.dto.post.request.FindAllPostsRequestDto;
import com.jh.backend.service.PostService;
import com.jh.backend.swagger.post.FindAllPostsSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게시글", description = "공개 게시글 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 공개 게시글 목록 조회
    @FindAllPostsSwaggerDocs
    @GetMapping
    public ResponseEntity<CommonApiResponse<PageResponseDto<FindAllPostsItem>>> findAllPosts(
            @Valid @ParameterObject FindAllPostsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(postService.findAllPosts(dto)));
    }
}

package com.jh.backend.dto.post.response;

import com.jh.backend.entity.PostMedia;
import io.swagger.v3.oas.annotations.media.Schema;

public record UploadPostImageResponseDto(

        @Schema(description = "게시글 미디어 PK (게시글 추가/수정시 postMediaIds로 전달)", example = "10")
        Long postMediaId,

        @Schema(description = "게시글 이미지 URL (본문 마크다운에 삽입)", example = "https://cdn.example.com/prod/post/3f2a9c1e-7b4d-4e0a-9c52-1d8f6a2b7e90.png")
        String postMediaUrl
) {

    public static UploadPostImageResponseDto fromEntity(PostMedia postMedia, String postMediaUrl) {
        return new UploadPostImageResponseDto(postMedia.getId(), postMediaUrl);
    }
}

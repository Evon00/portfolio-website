package com.jh.backend.dto.post.item;

import com.jh.backend.entity.PostMedia;
import io.swagger.v3.oas.annotations.media.Schema;

// 게시글 상세 조회 (수정용) 이미지
public record FindPostMediaItem(

        @Schema(description = "게시글 이미지 PK", example = "15")
        Long postMediaId,

        @Schema(description = "게시글 이미지 URL", example = "https://cdn.example.com/prod/post/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.png")
        String postMediaUrl,

        @Schema(description = "이미지 캡션 (없으면 null)", example = "중복 신청 흐름")
        String postMediaCaption
) {

    public static FindPostMediaItem fromEntity(PostMedia postMedia, String postMediaUrl) {
        return new FindPostMediaItem(
                postMedia.getId(),
                postMediaUrl,
                postMedia.getCaption());
    }
}

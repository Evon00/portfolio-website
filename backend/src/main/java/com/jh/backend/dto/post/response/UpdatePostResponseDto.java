package com.jh.backend.dto.post.response;

import com.jh.backend.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;

public record UpdatePostResponseDto(

        @Schema(description = "게시글 PK", example = "4")
        Long postId,

        @Schema(description = "게시글 슬러그", example = "redis-setifabsent-lock")
        String postSlug
) {

    public static UpdatePostResponseDto fromEntity(Post post) {
        return new UpdatePostResponseDto(post.getId(), post.getSlug());
    }
}

package com.jh.backend.dto.stats.item;

import com.jh.backend.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;

// 인기 게시글 항목
public record PopularPostItem(

        @Schema(description = "순위 (1부터, 동점도 다른 순위)", example = "1")
        int rank,

        @Schema(description = "게시글 PK", example = "1")
        Long postId,

        @Schema(description = "게시글 제목", example = "반복되는 기능 15종을 사내 공통 모듈로 만들기")
        String postTitle,

        @Schema(description = "게시글 슬러그", example = "common-module-15")
        String postSlug,

        @Schema(description = "조회수", example = "1284")
        Long postView
) {

    public static PopularPostItem fromEntity(int rank, Post post) {
        return new PopularPostItem(
                rank,
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getView());
    }
}

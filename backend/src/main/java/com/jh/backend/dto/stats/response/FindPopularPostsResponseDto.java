package com.jh.backend.dto.stats.response;

import com.jh.backend.dto.stats.item.PopularPostItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record FindPopularPostsResponseDto(

        @Schema(description = "인기 게시글 (조회수 내림차순)")
        List<PopularPostItem> posts
) {
}

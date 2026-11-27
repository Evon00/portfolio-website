package com.jh.backend.dto.post.item;

import com.jh.backend.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.List;

public record FindAllAdminPostsItem(

        @Schema(description = "게시글 PK", example = "1")
        Long postId,

        @Schema(description = "게시글 제목", example = "반복되는 기능 15종을 사내 공통 모듈로 만들기")
        String postTitle,

        @Schema(description = "게시글 슬러그", example = "common-module-15")
        String postSlug,

        @Schema(description = "조회수", example = "1284")
        Long postView,

        @Schema(description = "본문 수정일 (수정 전이면 null)", nullable = true, example = "2026-11-13T10:00:00+09:00")
        OffsetDateTime postModifiedAt,

        @Schema(description = "등록일", example = "2026-11-12T09:00:00+09:00")
        OffsetDateTime createdAt,

        @Schema(description = "기술 스택 (postSkillPriority 오름차순)")
        List<PostSkillItem> skills
) {

    public static FindAllAdminPostsItem fromEntity(Post post, List<PostSkillItem> skills) {
        return new FindAllAdminPostsItem(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getView(),
                post.getModifiedAt(),
                post.getCreatedAt(),
                skills);
    }
}

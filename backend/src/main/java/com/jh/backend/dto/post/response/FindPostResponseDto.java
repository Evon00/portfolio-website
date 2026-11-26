package com.jh.backend.dto.post.response;

import com.jh.backend.dto.post.item.FindPostMediaItem;
import com.jh.backend.dto.post.item.PostSkillItem;
import com.jh.backend.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record FindPostResponseDto(

        @Schema(description = "게시글 PK", example = "1")
        Long postId,

        @Schema(description = "게시글 제목", example = "반복되는 기능 15종을 사내 공통 모듈로 만들기")
        String postTitle,

        @Schema(description = "게시글 슬러그", example = "common-module-15")
        String postSlug,

        @Schema(description = "게시글 요약", example = "반복 구현되던 기능을 공통 모듈로 묶은 과정")
        String postSummary,

        @Schema(description = "게시글 본문 (마크다운 원문)", example = "## 배경\n...")
        String postContent,

        @Schema(description = "기술 스택 (postSkillPriority 오름차순)")
        List<PostSkillItem> skills,

        @Schema(description = "게시글에 연결된 이미지 (업로드 순서)")
        List<FindPostMediaItem> postMedias
) {

    public static FindPostResponseDto fromEntity(Post post, List<PostSkillItem> skills, List<FindPostMediaItem> postMedias) {
        return new FindPostResponseDto(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getContent(),
                skills,
                postMedias);
    }
}

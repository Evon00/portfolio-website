package com.jh.backend.dto.post.item;

import com.jh.backend.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.List;

public record FindAllPostsItem(

        @Schema(description = "게시글 PK", example = "4")
        Long postId,

        @Schema(description = "게시글 제목", example = "Redis setIfAbsent로 중복 신청 막기")
        String postTitle,

        @Schema(description = "게시글 요약", example = "확인과 저장 사이의 틈 때문에 생기던 중복 신청을 학번+이메일 락으로 해결한 기록")
        String postSummary,

        @Schema(description = "게시글 슬러그", example = "redis-setifabsent-lock")
        String postSlug,

        @Schema(description = "썸네일 URL (본문 첫 번째 업로드 이미지, 없으면 null)", nullable = true, example = "https://cdn.example.com/dev/post/1.png")
        String postThumbnailUrl,

        @Schema(description = "조회수", example = "1105")
        Long postView,

        @Schema(description = "등록일", example = "2026-10-16T09:00:00+09:00")
        OffsetDateTime createdAt,

        @Schema(description = "기술 스택 (postSkillPriority 오름차순)")
        List<PostSkillItem> skills
) {

    public static FindAllPostsItem fromEntity(Post post, String thumbnailUrl, List<PostSkillItem> skills) {
        return new FindAllPostsItem(
                post.getId(),
                post.getTitle(),
                post.getSummary(),
                post.getSlug(),
                thumbnailUrl,
                post.getView(),
                post.getCreatedAt(),
                skills);
    }
}

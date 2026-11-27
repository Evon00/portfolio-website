package com.jh.backend.dto.post.response;

import com.jh.backend.dto.post.item.PostSkillItem;
import com.jh.backend.entity.Post;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.List;

public record FindPostBySlugResponseDto(

        @Schema(description = "게시글 PK", example = "4")
        Long postId,

        @Schema(description = "게시글 제목", example = "Redis setIfAbsent로 중복 신청 막기")
        String postTitle,

        @Schema(description = "게시글 요약", example = "확인과 저장 사이의 틈 때문에 생기던 중복 신청을 학번+이메일 락으로 해결한 기록")
        String postSummary,

        @Schema(description = "게시글 본문 (마크다운 원문)", example = "## 문제 — 확인과 저장 사이의 틈\n...")
        String postContent,

        @Schema(description = "게시글 슬러그", example = "redis-setifabsent-lock")
        String postSlug,

        @Schema(description = "썸네일 URL (본문 첫 번째 업로드 이미지, 없으면 null)", nullable = true, example = "https://cdn.example.com/dev/post/1.png")
        String postThumbnailUrl,

        @Schema(description = "조회수 (이번 조회 반영)", example = "1105")
        Long postView,

        @Schema(description = "본문 수정일 (수정 전이면 null)", nullable = true, example = "2026-11-13T10:00:00+09:00")
        OffsetDateTime postModifiedAt,

        @Schema(description = "등록일", example = "2026-10-16T09:00:00+09:00")
        OffsetDateTime createdAt,

        @Schema(description = "기술 스택 (postSkillPriority 오름차순)")
        List<PostSkillItem> skills
) {

    public static FindPostBySlugResponseDto fromEntity(Post post, Long view, String thumbnailUrl, List<PostSkillItem> skills) {
        return new FindPostBySlugResponseDto(
                post.getId(),
                post.getTitle(),
                post.getSummary(),
                post.getContent(),
                post.getSlug(),
                thumbnailUrl,
                view,
                post.getModifiedAt(),
                post.getCreatedAt(),
                skills);
    }
}

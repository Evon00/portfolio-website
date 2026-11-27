package com.jh.backend.dto.post.request;

import com.jh.backend.common.RegexPatterns;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreatePostRequestDto(

        @NotBlank(message = "게시글 제목은 필수값입니다.")
        @Size(max = 100, message = "게시글 제목은 최대 100자까지 입력 가능합니다.")
        @Schema(description = "게시글 제목", requiredMode = Schema.RequiredMode.REQUIRED, example = "Redis setIfAbsent로 중복 신청 막기")
        String postTitle,

        @NotBlank(message = "게시글 슬러그는 필수값입니다.")
        @Size(max = 100, message = "게시글 슬러그는 최대 100자까지 입력 가능합니다.")
        @Pattern(regexp = RegexPatterns.SLUG, message = "게시글 슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있으며 하이픈으로 시작하거나 끝나거나 연속될 수 없습니다.")
        @Schema(description = "게시글 슬러그 (영문 소문자, 숫자, 하이픈 / 등록 후 변경 불가)", requiredMode = Schema.RequiredMode.REQUIRED, example = "redis-setifabsent-lock")
        String postSlug,

        @NotBlank(message = "게시글 요약은 필수값입니다.")
        @Size(max = 200, message = "게시글 요약은 최대 200자까지 입력 가능합니다.")
        @Schema(description = "게시글 요약", requiredMode = Schema.RequiredMode.REQUIRED, example = "확인과 저장 사이의 틈 때문에 생기던 중복 신청을 학번+이메일 락으로 해결한 기록")
        String postSummary,

        @NotBlank(message = "게시글 본문은 필수값입니다.")
        @Size(max = 100000, message = "게시글 본문은 최대 100,000자까지 입력 가능합니다.")
        @Schema(description = "게시글 본문 (마크다운)", requiredMode = Schema.RequiredMode.REQUIRED, example = "## 문제 — 확인과 저장 사이의 틈\n...")
        String postContent,

        @NotEmpty(message = "기술 스택은 1개 이상 선택해야 합니다.")
        @Size(max = 20, message = "기술 스택은 최대 20개까지 선택 가능합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "기술 스택 PK 목록 (배열 순서 = 태그 노출 순서)", requiredMode = Schema.RequiredMode.REQUIRED),
                schema = @Schema(description = "기술 스택 PK", example = "2"))
        List<@NotNull(message = "기술 스택 PK는 필수값입니다.") @Positive(message = "기술 스택 PK는 0보다 큰 양수여야 합니다.") Long> skillIds,

        @Size(max = 50, message = "게시글 이미지는 최대 50개까지 연결 가능합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "게시글 이미지 PK 목록 (이미지 업로드 API로 받은 postMediaId)"),
                schema = @Schema(description = "게시글 이미지 PK", example = "10"))
        List<@NotNull(message = "게시글 이미지 PK는 필수값입니다.") @Positive(message = "게시글 이미지 PK는 0보다 큰 양수여야 합니다.") Long> postMediaIds
) {

    // 제목, 요약 앞뒤 공백 제거 (본문은 마크다운이라 그대로 유지)
    public CreatePostRequestDto {
        postTitle = postTitle != null ? postTitle.strip() : null;
        postSummary = postSummary != null ? postSummary.strip() : null;
    }
}

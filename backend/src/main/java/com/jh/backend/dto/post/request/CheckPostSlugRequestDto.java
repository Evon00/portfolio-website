package com.jh.backend.dto.post.request;

import com.jh.backend.common.RegexPatterns;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckPostSlugRequestDto(

        @NotBlank(message = "게시글 슬러그는 필수값입니다.")
        @Size(max = 100, message = "게시글 슬러그는 최대 100자까지 입력 가능합니다.")
        @Pattern(regexp = RegexPatterns.SLUG, message = "게시글 슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있으며 하이픈으로 시작하거나 끝나거나 연속될 수 없습니다.")
        @Schema(description = "확인할 슬러그 (영문 소문자, 숫자, 하이픈)", requiredMode = Schema.RequiredMode.REQUIRED, example = "redis-setifabsent-lock")
        String postSlug
) {
}

package com.jh.backend.dto.post.request;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

// 게시글 수정 (PATCH, 보낸 필드만 수정 / null이면 기존 값 유지 / 슬러그는 수정 불가)
public record UpdatePostRequestDto(

        @Pattern(regexp = "(?s).*\\S.*", message = "게시글 제목은 공백일 수 없습니다.")
        @Size(max = 100, message = "게시글 제목은 최대 100자까지 입력 가능합니다.")
        @Schema(description = "게시글 제목 (보내지 않으면 기존 값 유지)", example = "Redis setIfAbsent로 중복 신청 막기")
        String postTitle,

        @Pattern(regexp = "(?s).*\\S.*", message = "게시글 요약은 공백일 수 없습니다.")
        @Size(max = 200, message = "게시글 요약은 최대 200자까지 입력 가능합니다.")
        @Schema(description = "게시글 요약 (보내지 않으면 기존 값 유지)", example = "확인과 저장 사이의 틈 때문에 생기던 중복 신청을 학번+이메일 락으로 해결한 기록")
        String postSummary,

        @Pattern(regexp = "(?s).*\\S.*", message = "게시글 본문은 공백일 수 없습니다.")
        @Size(max = 100000, message = "게시글 본문은 최대 100,000자까지 입력 가능합니다.")
        @Schema(description = "게시글 본문 (마크다운, 보내지 않으면 기존 값 유지)", example = "## 문제 — 확인과 저장 사이의 틈\n...")
        String postContent,

        @Size(min = 1, max = 20, message = "기술 스택은 1개 이상 20개 이하로 선택해야 합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "기술 스택 PK 목록 (보내면 전체 교체, 배열 순서 = 태그 노출 순서, 보내지 않으면 기존 값 유지)"),
                schema = @Schema(description = "기술 스택 PK", example = "2"))
        List<@NotNull(message = "기술 스택 PK는 필수값입니다.") @Positive(message = "기술 스택 PK는 0보다 큰 양수여야 합니다.") Long> skillIds,

        @Size(max = 50, message = "게시글 이미지는 최대 50개까지 연결 가능합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "본문에 남아 있는 게시글 이미지 PK 전체 (기존 + 신규, 보내지 않으면 기존 연결 유지, 빈 배열이면 모두 해제)"),
                schema = @Schema(description = "게시글 이미지 PK", example = "10"))
        List<@NotNull(message = "게시글 이미지 PK는 필수값입니다.") @Positive(message = "게시글 이미지 PK는 0보다 큰 양수여야 합니다.") Long> postMediaIds
) {

    // 제목, 요약 앞뒤 공백 제거 (본문은 마크다운이라 그대로 유지)
    public UpdatePostRequestDto {
        postTitle = postTitle != null ? postTitle.strip() : null;
        postSummary = postSummary != null ? postSummary.strip() : null;
    }
}

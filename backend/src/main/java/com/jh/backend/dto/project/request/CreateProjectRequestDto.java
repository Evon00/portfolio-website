package com.jh.backend.dto.project.request;

import com.jh.backend.common.RegexPatterns;
import com.jh.backend.dto.project.item.CreateProjectMediaItem;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateProjectRequestDto(

        @NotBlank(message = "프로젝트 제목은 필수값입니다.")
        @Size(max = 100, message = "프로젝트 제목은 최대 100자까지 입력 가능합니다.")
        @Schema(description = "프로젝트 제목", requiredMode = Schema.RequiredMode.REQUIRED, example = "경북대학교 로봇 부트캠프 사이트")
        String projectTitle,

        @NotBlank(message = "프로젝트 슬러그는 필수값입니다.")
        @Size(max = 100, message = "프로젝트 슬러그는 최대 100자까지 입력 가능합니다.")
        @Pattern(regexp = RegexPatterns.SLUG, message = "프로젝트 슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있으며 하이픈으로 시작하거나 끝나거나 연속될 수 없습니다.")
        @Schema(description = "프로젝트 슬러그 (영문 소문자, 숫자, 하이픈 / 등록 후 변경 불가)", requiredMode = Schema.RequiredMode.REQUIRED, example = "knu-robotics")
        String projectSlug,

        @NotBlank(message = "프로젝트 요약은 필수값입니다.")
        @Size(max = 200, message = "프로젝트 요약은 최대 200자까지 입력 가능합니다.")
        @Schema(description = "프로젝트 요약", requiredMode = Schema.RequiredMode.REQUIRED, example = "대학 사업 신청·운영 사이트 백엔드를 단독으로 맡아 약 1개월 만에 운영 배포")
        String projectSummary,

        @NotBlank(message = "프로젝트 본문은 필수값입니다.")
        @Size(max = 100000, message = "프로젝트 본문은 최대 100,000자까지 입력 가능합니다.")
        @Schema(description = "프로젝트 본문 (마크다운)", requiredMode = Schema.RequiredMode.REQUIRED, example = "## 프로젝트 소개\n...")
        String projectContent,

        @NotNull(message = "프로젝트 시작일은 필수값입니다.")
        @Schema(description = "프로젝트 시작일 (YYYY-MM-DD)", requiredMode = Schema.RequiredMode.REQUIRED, example = "2026-07-02")
        LocalDate projectStartDate,

        @Schema(description = "프로젝트 종료일 (YYYY-MM-DD, 진행 중이면 null, 시작일 이후)", example = "2026-08-01")
        LocalDate projectEndDate,

        @Size(max = 300, message = "GitHub 주소는 최대 300자까지 입력 가능합니다.")
        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "GitHub 주소는 http:// 또는 https://로 시작하는 주소여야 합니다.")
        @Schema(description = "GitHub 주소 (http(s)://, 최대 300자)", example = "https://github.com/example/knu-robotics")
        String projectGithubUrl,

        @Schema(description = "GitHub 레포지토리 공개 여부 (기본 false)", example = "false")
        Boolean projectGithubIsPublic,

        @Size(max = 300, message = "사이트 주소는 최대 300자까지 입력 가능합니다.")
        @Pattern(regexp = RegexPatterns.HTTP_URL, message = "사이트 주소는 http:// 또는 https://로 시작하는 주소여야 합니다.")
        @Schema(description = "사이트 주소 (http(s)://, 최대 300자)", example = "https://robotics.knu.ac.kr")
        String projectUrl,

        @NotEmpty(message = "기술 스택은 1개 이상 선택해야 합니다.")
        @Size(max = 20, message = "기술 스택은 최대 20개까지 선택 가능합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "기술 스택 PK 목록 (배열 순서 = 태그 노출 순서)", requiredMode = Schema.RequiredMode.REQUIRED),
                schema = @Schema(description = "기술 스택 PK", example = "2"))
        List<@NotNull(message = "기술 스택 PK는 필수값입니다.") @Positive(message = "기술 스택 PK는 0보다 큰 양수여야 합니다.") Long> skillIds,

        @Size(max = 10, message = "프로젝트 이미지는 최대 10장까지 등록 가능합니다.")
        @ArraySchema(arraySchema = @Schema(description = "갤러리 이미지 정보 (배열 순서 = 이미지 노출 순서, files의 모든 파일이 한 번씩 포함되어야 함)"))
        List<@NotNull(message = "프로젝트 이미지 정보는 필수값입니다.") @Valid CreateProjectMediaItem> projectMedias
) {

    // 제목, 요약 앞뒤 공백 제거 (본문은 마크다운이라 그대로 유지)
    // URL은 앞뒤 공백 제거 후 비어 있으면 null
    public CreateProjectRequestDto {
        projectTitle = projectTitle != null ? projectTitle.strip() : null;
        projectSummary = projectSummary != null ? projectSummary.strip() : null;
        projectGithubUrl = projectGithubUrl != null && !projectGithubUrl.isBlank() ? projectGithubUrl.strip() : null;
        projectUrl = projectUrl != null && !projectUrl.isBlank() ? projectUrl.strip() : null;
    }
}

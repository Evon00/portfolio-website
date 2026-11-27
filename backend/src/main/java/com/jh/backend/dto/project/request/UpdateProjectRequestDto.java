package com.jh.backend.dto.project.request;

import com.jh.backend.dto.project.item.UpdateProjectMediaItem;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

// 프로젝트 수정 (PATCH, 보낸 필드만 수정 / null이면 기존 값 유지 / 슬러그는 수정 불가)
//      -> 종료일, GitHub 주소, 사이트 주소는 빈 문자열이면 값을 지움 (null로 저장)
public record UpdateProjectRequestDto(

        @Pattern(regexp = "(?s).*\\S.*", message = "프로젝트 제목은 공백일 수 없습니다.")
        @Size(max = 100, message = "프로젝트 제목은 최대 100자까지 입력 가능합니다.")
        @Schema(description = "프로젝트 제목 (보내지 않으면 기존 값 유지)", example = "경북대학교 로봇 부트캠프 사이트")
        String projectTitle,

        @Pattern(regexp = "(?s).*\\S.*", message = "프로젝트 요약은 공백일 수 없습니다.")
        @Size(max = 200, message = "프로젝트 요약은 최대 200자까지 입력 가능합니다.")
        @Schema(description = "프로젝트 요약 (보내지 않으면 기존 값 유지)", example = "대학 사업 신청·운영 사이트 백엔드를 단독으로 맡아 약 1개월 만에 운영 배포")
        String projectSummary,

        @Pattern(regexp = "(?s).*\\S.*", message = "프로젝트 본문은 공백일 수 없습니다.")
        @Size(max = 100000, message = "프로젝트 본문은 최대 100,000자까지 입력 가능합니다.")
        @Schema(description = "프로젝트 본문 (마크다운, 보내지 않으면 기존 값 유지)", example = "## 프로젝트 소개\n...")
        String projectContent,

        @Schema(description = "프로젝트 시작일 (YYYY-MM-DD, 보내지 않으면 기존 값 유지)", example = "2026-07-02")
        LocalDate projectStartDate,

        @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "프로젝트 종료일은 YYYY-MM-DD 형식이거나 빈 값이어야 합니다.")
        @Schema(description = "프로젝트 종료일 (YYYY-MM-DD, 보내지 않으면 기존 값 유지, 빈 문자열이면 지움 = 진행 중)", example = "2026-09-30")
        String projectEndDate,

        @Size(max = 300, message = "GitHub 주소는 최대 300자까지 입력 가능합니다.")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "GitHub 주소는 http:// 또는 https://로 시작하는 주소여야 합니다.")
        @Schema(description = "GitHub 주소 (http(s)://, 보내지 않으면 기존 값 유지, 빈 문자열이면 지움)", example = "https://github.com/example/knu-robotics")
        String projectGithubUrl,

        @Schema(description = "GitHub 레포지토리 공개 여부 (보내지 않으면 기존 값 유지)", example = "false")
        Boolean projectGithubIsPublic,

        @Size(max = 300, message = "사이트 주소는 최대 300자까지 입력 가능합니다.")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "사이트 주소는 http:// 또는 https://로 시작하는 주소여야 합니다.")
        @Schema(description = "사이트 주소 (http(s)://, 보내지 않으면 기존 값 유지, 빈 문자열이면 지움)", example = "https://robotics.knu.ac.kr")
        String projectUrl,

        @Size(min = 1, max = 20, message = "기술 스택은 1개 이상 20개 이하로 선택해야 합니다.")
        @ArraySchema(
                arraySchema = @Schema(description = "기술 스택 PK 목록 (보내면 전체 교체, 배열 순서 = 태그 노출 순서, 보내지 않으면 기존 값 유지)"),
                schema = @Schema(description = "기술 스택 PK", example = "2"))
        List<@NotNull(message = "기술 스택 PK는 필수값입니다.") @Positive(message = "기술 스택 PK는 0보다 큰 양수여야 합니다.") Long> skillIds,

        @Size(max = 10, message = "프로젝트 이미지는 최대 10장까지 등록 가능합니다.")
        @ArraySchema(arraySchema = @Schema(description = "수정 후 최종 갤러리 전체 (배열 순서 = 이미지 노출 순서, 보내지 않으면 기존 이미지 유지, 빈 배열이면 전체 삭제)"))
        List<@NotNull(message = "프로젝트 이미지 정보는 필수값입니다.") @Valid UpdateProjectMediaItem> projectMedias
) {

    // 제목, 요약, 종료일, URL 앞뒤 공백 제거 (본문은 마크다운이라 그대로 유지)
    //      -> 종료일, URL은 공백만 있으면 빈 문자열(지움)로 처리
    public UpdateProjectRequestDto {
        projectTitle = projectTitle != null ? projectTitle.strip() : null;
        projectSummary = projectSummary != null ? projectSummary.strip() : null;
        projectEndDate = projectEndDate != null ? projectEndDate.strip() : null;
        projectGithubUrl = projectGithubUrl != null ? projectGithubUrl.strip() : null;
        projectUrl = projectUrl != null ? projectUrl.strip() : null;
    }
}

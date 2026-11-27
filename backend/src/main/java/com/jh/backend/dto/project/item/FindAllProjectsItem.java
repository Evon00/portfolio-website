package com.jh.backend.dto.project.item;

import com.jh.backend.entity.Project;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

public record FindAllProjectsItem(

        @Schema(description = "프로젝트 PK", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 제목", example = "경북대학교 로봇 부트캠프 사이트")
        String projectTitle,

        @Schema(description = "프로젝트 요약", example = "대학 사업 신청·운영 사이트 백엔드를 단독으로 맡아 약 1개월 만에 운영 배포")
        String projectSummary,

        @Schema(description = "프로젝트 슬러그", example = "knu-robotics")
        String projectSlug,

        @Schema(description = "프로젝트 시작일", example = "2026-07-02")
        LocalDate projectStartDate,

        @Schema(description = "프로젝트 종료일 (진행 중이면 null)", nullable = true, example = "2026-09-30")
        LocalDate projectEndDate,

        @Schema(description = "GitHub 주소 (없으면 null)", nullable = true, example = "https://github.com/example/knu-robotics")
        String projectGithubUrl,

        @Schema(description = "GitHub 레포지토리 공개 여부 (false면 자물쇠 표시)", example = "false")
        boolean projectGithubIsPublic,

        @Schema(description = "사이트 주소 (없으면 null)", nullable = true, example = "https://robotics.knu.ac.kr")
        String projectUrl,

        @Schema(description = "대표 이미지 URL (없으면 null)", nullable = true, example = "https://cdn.example.com/prod/project/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.png")
        String projectMediaUrl,

        @Schema(description = "기술 스택 (projectSkillPriority 오름차순)")
        List<ProjectSkillItem> skills
) {

    public static FindAllProjectsItem fromEntity(Project project, String mediaUrl, List<ProjectSkillItem> skills) {
        return new FindAllProjectsItem(
                project.getId(),
                project.getTitle(),
                project.getSummary(),
                project.getSlug(),
                project.getStartDate(),
                project.getEndDate(),
                project.getGithubUrl(),
                project.isGithubIsPublic(),
                project.getUrl(),
                mediaUrl,
                skills);
    }
}

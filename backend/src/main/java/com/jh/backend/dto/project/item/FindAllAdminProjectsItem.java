package com.jh.backend.dto.project.item;

import com.jh.backend.entity.Project;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

public record FindAllAdminProjectsItem(

        @Schema(description = "프로젝트 PK", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 제목", example = "경북대학교 로봇 부트캠프 사이트")
        String projectTitle,

        @Schema(description = "프로젝트 슬러그", example = "knu-robotics")
        String projectSlug,

        @Schema(description = "프로젝트 시작일", example = "2026-07-02")
        LocalDate projectStartDate,

        @Schema(description = "프로젝트 종료일 (진행 중이면 null)", nullable = true, example = "2026-09-30")
        LocalDate projectEndDate,

        @Schema(description = "프로젝트 순서 (오름차순 정렬)", example = "1")
        Integer projectPriority,

        @Schema(description = "갤러리 이미지 수 (0이면 없음)", example = "4")
        long projectMediaCount,

        @Schema(description = "기술 스택 (projectSkillPriority 오름차순)")
        List<ProjectSkillItem> skills
) {

    public static FindAllAdminProjectsItem fromEntity(Project project, long mediaCount, List<ProjectSkillItem> skills) {
        return new FindAllAdminProjectsItem(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getStartDate(),
                project.getEndDate(),
                project.getPriority(),
                mediaCount,
                skills);
    }
}

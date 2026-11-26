package com.jh.backend.dto.project.response;

import com.jh.backend.entity.Project;
import io.swagger.v3.oas.annotations.media.Schema;

public record CreateProjectResponseDto(

        @Schema(description = "프로젝트 PK", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 슬러그", example = "knu-robotics")
        String projectSlug
) {

    public static CreateProjectResponseDto fromEntity(Project project) {
        return new CreateProjectResponseDto(project.getId(), project.getSlug());
    }
}

package com.jh.backend.dto.project.response;

import com.jh.backend.entity.Project;
import io.swagger.v3.oas.annotations.media.Schema;

public record UpdateProjectResponseDto(

        @Schema(description = "프로젝트 PK", example = "1")
        Long projectId,

        @Schema(description = "프로젝트 슬러그", example = "knu-robotics")
        String projectSlug
) {

    public static UpdateProjectResponseDto fromEntity(Project project) {
        return new UpdateProjectResponseDto(project.getId(), project.getSlug());
    }
}

package com.jh.backend.dto.project.response;

import com.jh.backend.entity.Project;
import io.swagger.v3.oas.annotations.media.Schema;

public record UpdateProjectPriorityResponseDto(

        @Schema(description = "프로젝트 PK", example = "5")
        Long projectId,

        @Schema(description = "변경된 프로젝트 순서", example = "2")
        Integer projectPriority
) {

    public static UpdateProjectPriorityResponseDto fromEntity(Project project) {
        return new UpdateProjectPriorityResponseDto(project.getId(), project.getPriority());
    }
}

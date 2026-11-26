package com.jh.backend.dto.project.item;

import com.jh.backend.entity.ProjectSkill;
import io.swagger.v3.oas.annotations.media.Schema;

// 프로젝트 기술 스택 (목록, 상세 공용)
public record ProjectSkillItem(

        @Schema(description = "기술 스택 PK", example = "1")
        Long skillId,

        @Schema(description = "기술 스택 이름", example = "Java")
        String skillName,

        @Schema(description = "기술 스택 카테고리", example = "Backend")
        String skillCategory,

        @Schema(description = "기술 스택 아이콘 URL", example = "https://cdn.example.com/prod/skill/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.svg")
        String skillUrl,

        @Schema(description = "프로젝트 기술 스택 순서 (1부터)", example = "1")
        Integer projectSkillPriority
) {

    public static ProjectSkillItem fromEntity(ProjectSkill projectSkill, String skillUrl) {
        return new ProjectSkillItem(
                projectSkill.getSkill().getId(),
                projectSkill.getSkill().getName(),
                projectSkill.getSkill().getCategory(),
                skillUrl,
                projectSkill.getPriority());
    }
}

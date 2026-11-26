package com.jh.backend.dto.profile.item;

import com.jh.backend.entity.AdminSkill;
import io.swagger.v3.oas.annotations.media.Schema;

public record FindProfileItem(

        @Schema(description = "기술 스택 PK", example = "2")
        Long skillId,

        @Schema(description = "기술 스택 이름", example = "Spring Boot")
        String skillName,

        @Schema(description = "기술 스택 카테고리", example = "Backend")
        String skillCategory,

        @Schema(description = "기술 스택 아이콘 URL", example = "https://cdn.example.com/prod/skill/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.svg")
        String skillUrl,

        @Schema(description = "핵심 기술 스택 순서 (1부터)", example = "1")
        Integer adminSkillPriority
) {

    public static FindProfileItem fromEntity(AdminSkill adminSkill, String skillUrl) {
        return new FindProfileItem(
                adminSkill.getSkill().getId(),
                adminSkill.getSkill().getName(),
                adminSkill.getSkill().getCategory(),
                skillUrl,
                adminSkill.getPriority());
    }
}

package com.jh.backend.dto.skill.item;

import com.jh.backend.entity.Skill;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

public record FindAllSkillsItem(

        @Schema(description = "기술 스택 PK", example = "2")
        Long skillId,

        @Schema(description = "기술 스택 이름", example = "Spring Boot")
        String skillName,

        @Schema(description = "기술 스택 카테고리", example = "Backend")
        String skillCategory,

        @Schema(description = "기술 스택 아이콘 URL", nullable = true, example = "https://cdn.example.com/prod/skill/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.svg")
        String skillUrl,

        @Schema(description = "생성일", example = "2026-11-10T09:00:00+09:00")
        OffsetDateTime createdAt
) {

    public static FindAllSkillsItem fromEntity(Skill skill, String skillUrl) {
        return new FindAllSkillsItem(skill.getId(), skill.getName(), skill.getCategory(), skillUrl, skill.getCreatedAt());
    }
}

package com.jh.backend.dto.post.item;

import com.jh.backend.entity.PostSkill;
import io.swagger.v3.oas.annotations.media.Schema;

// 게시글 기술 스택 (목록, 상세 공용)
public record PostSkillItem(

        @Schema(description = "기술 스택 PK", example = "7")
        Long skillId,

        @Schema(description = "기술 스택 이름", example = "Redis")
        String skillName,

        @Schema(description = "기술 스택 카테고리", example = "Database")
        String skillCategory,

        @Schema(description = "기술 스택 아이콘 URL", example = "https://cdn.example.com/prod/skill/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.svg")
        String skillUrl,

        @Schema(description = "게시글 기술 스택 순서 (1부터)", example = "1")
        Integer postSkillPriority
) {

    public static PostSkillItem fromEntity(PostSkill postSkill, String skillUrl) {
        return new PostSkillItem(
                postSkill.getSkill().getId(),
                postSkill.getSkill().getName(),
                postSkill.getSkill().getCategory(),
                skillUrl,
                postSkill.getPriority());
    }
}

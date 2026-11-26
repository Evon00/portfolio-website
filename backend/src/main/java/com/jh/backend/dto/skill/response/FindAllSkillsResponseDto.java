package com.jh.backend.dto.skill.response;

import com.jh.backend.dto.skill.item.FindAllSkillsItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record FindAllSkillsResponseDto(

        @Schema(description = "조회된 기술 스택 수", example = "1")
        int totalCount,

        @Schema(description = "기술 스택 목록 (등록일 내림차순)")
        List<FindAllSkillsItem> skills
) {

    public static FindAllSkillsResponseDto from(List<FindAllSkillsItem> skills) {
        return new FindAllSkillsResponseDto(skills.size(), skills);
    }
}

package com.jh.backend.dto.skill.item;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

// 기술 스택 연결 실패(SKILL_005)시 존재하지 않는 기술 스택 PK 목록
public record InvalidSkillIdsItem(

        @ArraySchema(schema = @Schema(description = "존재하지 않거나 삭제된 기술 스택 PK", example = "999"))
        List<Long> skillIds
) {
}

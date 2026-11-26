package com.jh.backend.dto.profile.response;

import com.jh.backend.dto.profile.item.FindProfileItem;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record UpdateProfileSkillsResponseDto(

        @Schema(description = "핵심 기술 스택 (adminSkillPriority 오름차순)")
        List<FindProfileItem> skills
) {
}

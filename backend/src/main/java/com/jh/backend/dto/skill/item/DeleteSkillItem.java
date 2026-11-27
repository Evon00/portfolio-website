package com.jh.backend.dto.skill.item;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;

// 기술 스택 삭제 실패(409)시 사용처 정보
public record DeleteSkillItem(

        @Schema(description = "사용 중인 게시글 수", example = "3")
        long postCount,

        @Schema(description = "사용 중인 프로젝트 수", example = "5")
        long projectCount,

        @Schema(description = "관리자 프로필 사용 여부", example = "true")
        boolean profileUsed
) {

    // 하나라도 사용 중인지 여부 (응답에는 포함하지 않음)
    @JsonIgnore
    public boolean isInUse() {
        return postCount > 0 || projectCount > 0 || profileUsed;
    }
}

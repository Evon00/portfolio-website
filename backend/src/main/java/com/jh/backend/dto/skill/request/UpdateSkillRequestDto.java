package com.jh.backend.dto.skill.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateSkillRequestDto(

        @Pattern(regexp = "(?s).*\\S.*", message = "기술 스택 이름은 공백일 수 없습니다.")
        @Size(max = 100, message = "기술 스택 이름은 최대 100자까지 입력 가능합니다.")
        @Schema(description = "기술 스택 이름 (보내지 않으면 기존 값 유지)", example = "Apache Kafka")
        String skillName,

        @Pattern(regexp = "(?s).*\\S.*", message = "기술 스택 카테고리는 공백일 수 없습니다.")
        @Size(max = 100, message = "기술 스택 카테고리는 최대 100자까지 입력 가능합니다.")
        @Schema(description = "기술 스택 카테고리 (보내지 않으면 기존 값 유지)", example = "Backend")
        String skillCategory,

        @Schema(description = "아이콘 삭제 여부 (true면 아이콘 삭제, 보내지 않거나 false면 유지, file과 함께 보낼 수 없음)", example = "false")
        Boolean deleteIcon
) {

    // 앞뒤 공백 제거 (검증 전에 적용)
    public UpdateSkillRequestDto {
        skillName = strip(skillName);
        skillCategory = strip(skillCategory);
    }

    private static String strip(String value) {
        return value != null ? value.strip() : null;
    }
}

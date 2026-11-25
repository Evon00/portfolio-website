package com.jh.backend.dto.auth.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDto(
        @Schema(description = "관리자 아이디", example = "admin")
        @NotBlank(message = "아이디는 필수값입니다.")
        String adminUsername,

        @Schema(description = "관리자 비밀번호", example = "********")
        @NotBlank(message = "비밀번호는 필수값입니다.")
        String adminPassword
) {
}

package com.jh.backend.dto.auth.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record AccessTokenResponseDto(
        @Schema(description = "Access Token", example = "eyJhbGciOi...")
        String accessToken
) {
}

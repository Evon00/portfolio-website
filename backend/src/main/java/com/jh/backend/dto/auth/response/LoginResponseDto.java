package com.jh.backend.dto.auth.response;

import com.jh.backend.dto.auth.item.TokenItem;
import io.swagger.v3.oas.annotations.media.Schema;

public record LoginResponseDto(
        @Schema(description = "Access Token", example = "eyJhbGciOi...")
        String accessToken
) {

    public static LoginResponseDto from(TokenItem tokens) {
        return new LoginResponseDto(tokens.accessToken());
    }
}

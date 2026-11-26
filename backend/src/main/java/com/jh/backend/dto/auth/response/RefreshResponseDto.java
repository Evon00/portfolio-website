package com.jh.backend.dto.auth.response;

import com.jh.backend.dto.auth.item.TokenItem;
import io.swagger.v3.oas.annotations.media.Schema;

public record RefreshResponseDto(
        @Schema(description = "새로 발급한 Access Token", example = "eyJhbGciOi...")
        String accessToken
) {

    public static RefreshResponseDto from(TokenItem tokens) {
        return new RefreshResponseDto(tokens.accessToken());
    }
}

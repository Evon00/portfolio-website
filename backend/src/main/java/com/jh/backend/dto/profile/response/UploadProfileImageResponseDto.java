package com.jh.backend.dto.profile.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record UploadProfileImageResponseDto(

        @Schema(description = "프로필 이미지 URL", example = "https://cdn.example.com/prod/profile/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.png")
        String adminProfileUrl
) {
}

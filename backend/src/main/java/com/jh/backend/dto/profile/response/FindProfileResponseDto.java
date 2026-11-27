package com.jh.backend.dto.profile.response;

import com.jh.backend.dto.profile.item.FindProfileItem;
import com.jh.backend.entity.Admin;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record FindProfileResponseDto(

        @Schema(description = "관리자 이름", example = "유재혁")
        String adminName,

        @Schema(description = "관리자 소개", example = "백엔드를 설계부터 운영 배포까지 책임지는 백엔드 개발자입니다.")
        String adminDescription,

        @Schema(description = "GitHub 주소 (없으면 null)", nullable = true, example = "https://github.com/Evon00")
        String adminGithubUrl,

        @Schema(description = "이메일 (없으면 null)", nullable = true, example = "hello@example.com")
        String adminEmail,

        @Schema(description = "프로필 이미지 URL (없으면 null)", nullable = true, example = "https://cdn.example.com/prod/profile/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.png")
        String adminProfileUrl,

        @Schema(description = "핵심 기술 스택 (adminSkillPriority 오름차순)")
        List<FindProfileItem> skills
) {

    public static FindProfileResponseDto from(Admin admin, String adminProfileUrl, List<FindProfileItem> skills) {
        return new FindProfileResponseDto(admin.getName(), admin.getDescription(), admin.getGithubUrl(), admin.getEmail(), adminProfileUrl, skills);
    }
}

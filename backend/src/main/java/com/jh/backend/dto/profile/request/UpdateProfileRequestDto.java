package com.jh.backend.dto.profile.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

public record UpdateProfileRequestDto(

        @Pattern(regexp = "(?s).*\\S.*", message = "관리자 이름은 공백일 수 없습니다.")
        @Size(max = 10, message = "관리자 이름은 최대 10자까지 입력 가능합니다.")
        @Schema(description = "관리자 이름 (보내지 않으면 기존 값 유지)", example = "유재혁")
        String adminName,

        @Pattern(regexp = "(?s).*\\S.*", message = "관리자 소개는 공백일 수 없습니다.")
        @Size(max = 200, message = "관리자 소개는 최대 200자까지 입력 가능합니다.")
        @Schema(description = "관리자 소개 (보내지 않으면 기존 값 유지)", example = "백엔드를 설계부터 운영 배포까지 책임지는 백엔드 개발자입니다.")
        String adminDescription,

        @URL(protocol = "https", message = "GitHub 주소는 https로 시작하는 URL 형식이어야 합니다.")
        @Size(max = 300, message = "GitHub 주소는 최대 300자까지 입력 가능합니다.")
        @Schema(description = "GitHub 주소 (보내지 않으면 기존 값 유지, 빈 문자열이면 값 비움)", example = "https://github.com/Evon00")
        String adminGithubUrl,

        @Email(message = "이메일 형식이 올바르지 않습니다.")
        @Size(max = 300, message = "이메일은 최대 300자까지 입력 가능합니다.")
        @Schema(description = "이메일 (보내지 않으면 기존 값 유지, 빈 문자열이면 값 비움)", example = "hello@example.com")
        String adminEmail
) {

    // 앞뒤 공백 제거 (검증 전에 적용되어 공백이 붙은 URL, 이메일도 정상 처리)
    public UpdateProfileRequestDto {
        adminName = strip(adminName);
        adminDescription = strip(adminDescription);
        adminGithubUrl = strip(adminGithubUrl);
        adminEmail = strip(adminEmail);
    }

    private static String strip(String value) {
        return value != null ? value.strip() : null;
    }
}

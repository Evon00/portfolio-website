package com.jh.backend.dto.auth;

// 서비스에서 컨트롤러로 전달하는 토큰 (Access Token은 Body, Refresh Token은 쿠키)
public record TokenDto(String accessToken, String refreshToken) {
}

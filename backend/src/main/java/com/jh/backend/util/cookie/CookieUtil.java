package com.jh.backend.util.cookie;

import com.jh.backend.common.properties.CookieProperties;
import com.jh.backend.common.properties.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class CookieUtil {

    public static final String REFRESH_TOKEN = "refreshToken";

    private final CookieProperties cookieProperties;
    private final JwtProperties jwtProperties;

    // 리프레시 토큰 쿠키 생성
    public ResponseCookie createRefreshCookie(String refreshToken) {
        return build(refreshToken, jwtProperties.refreshTokenExpiry());
    }

    // 리프레시 토큰 쿠키 만료
    public ResponseCookie expireRefreshCookie() {
        return build("", Duration.ZERO);
    }

    private ResponseCookie build(String value, Duration maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN, value)
                .maxAge(maxAge)
                .path(cookieProperties.path())
                .sameSite(cookieProperties.sameSite())
                .httpOnly(true)
                .secure(cookieProperties.secure())
                .build();
    }
}

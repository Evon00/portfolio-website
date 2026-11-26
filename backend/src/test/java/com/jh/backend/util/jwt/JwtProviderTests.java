package com.jh.backend.util.jwt;

import com.jh.backend.common.enums.Role;
import com.jh.backend.common.properties.JwtProperties;
import com.jh.backend.exception.AuthException;
import com.jh.backend.exception.ExceptionCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtProviderTests {

    private static final JwtPayload PAYLOAD = new JwtPayload(7L, Role.ADMIN);

    private final JwtProvider provider = provider((byte) 1, Duration.ofMinutes(1));

    @Test
    @DisplayName("발급한 토큰에서 정보를 추출한다")
    void parse() {
        assertThat(provider.parse(provider.createAccessToken(PAYLOAD), TokenType.ACCESS)).isEqualTo(PAYLOAD);
        assertThat(provider.parse(provider.createRefreshToken(PAYLOAD), TokenType.REFRESH)).isEqualTo(PAYLOAD);
    }

    @Test
    @DisplayName("같은 시각에 발급해도 서로 다른 토큰이다")
    void unique() {
        assertThat(provider.createRefreshToken(PAYLOAD)).isNotEqualTo(provider.createRefreshToken(PAYLOAD));
    }

    @Test
    @DisplayName("access와 refresh는 서로 바꿔 사용할 수 없다")
    void type() {
        assertCode(provider, provider.createRefreshToken(PAYLOAD), TokenType.ACCESS, ExceptionCode.JWT_INVALID);
        assertCode(provider, provider.createAccessToken(PAYLOAD), TokenType.REFRESH, ExceptionCode.REFRESH_JWT_INVALID);
    }

    @Test
    @DisplayName("만료와 위조를 구분한다")
    void expiredAndInvalid() {
        JwtProvider expired = provider((byte) 1, Duration.ofMinutes(-1));
        assertCode(provider, expired.createAccessToken(PAYLOAD), TokenType.ACCESS, ExceptionCode.JWT_EXPIRED);
        assertCode(provider, expired.createRefreshToken(PAYLOAD), TokenType.REFRESH, ExceptionCode.REFRESH_JWT_EXPIRED);

        JwtProvider other = provider((byte) 2, Duration.ofMinutes(1));
        assertCode(provider, other.createAccessToken(PAYLOAD), TokenType.ACCESS, ExceptionCode.JWT_INVALID);
        for (String token : new String[]{"", " ", "abc", "a.b.c"}) {
            assertCode(provider, token, TokenType.ACCESS, ExceptionCode.JWT_INVALID);
        }
    }

    private static JwtProvider provider(byte seed, Duration expiry) {
        byte[] key = new byte[64];
        java.util.Arrays.fill(key, seed);
        return new JwtProvider(new JwtProperties(Base64.getEncoder().encodeToString(key), expiry, expiry));
    }

    private static void assertCode(JwtProvider provider, String token, TokenType type, ExceptionCode code) {
        assertThatThrownBy(() -> provider.parse(token, type))
                .isInstanceOfSatisfying(AuthException.class, ex -> assertThat(ex.getExceptionCode()).isEqualTo(code));
    }
}

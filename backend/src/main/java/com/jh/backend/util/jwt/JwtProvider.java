package com.jh.backend.util.jwt;

import com.jh.backend.common.enums.Role;
import com.jh.backend.common.properties.JwtProperties;
import com.jh.backend.exception.AuthException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

/*
JWT 생성 및 검증
- type : ACCESS, REFRESH 구분 (서로 바꿔 사용할 수 없음)
- jti : 같은 시각에 발급해도 서로 다른 토큰이 되도록 하는 고유값
 */
@Component
public class JwtProvider {

    private static final String ROLE = "role";
    private static final String TYPE = "type";

    private final SecretKey key;
    private final JwtProperties jwtProperties;

    public JwtProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtProperties.secret()));
    }

    // 액세스 토큰 생성
    public String createAccessToken(JwtPayload payload) {
        return createToken(payload, TokenType.ACCESS, jwtProperties.accessTokenExpiry());
    }

    // 리프레시 토큰 생성
    public String createRefreshToken(JwtPayload payload) {
        return createToken(payload, TokenType.REFRESH, jwtProperties.refreshTokenExpiry());
    }

    // 토큰 검증 후 정보 추출
    public JwtPayload parse(String token, TokenType type) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .require(TYPE, type.name())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return new JwtPayload(Long.valueOf(claims.getSubject()), Role.valueOf(claims.get(ROLE, String.class)));
        } catch (ExpiredJwtException ex) {
            throw new AuthException(type.getExpired());
        } catch (JwtException | IllegalArgumentException | NullPointerException ex) {
            throw new AuthException(type.getInvalid());
        }
    }

    private String createToken(JwtPayload payload, TokenType type, Duration expiry) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(payload.id().toString())
                .claim(ROLE, payload.role().name())
                .claim(TYPE, type.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiry)))
                .signWith(key)
                .compact();
    }
}

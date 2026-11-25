package com.jh.backend.service;

import com.jh.backend.common.enums.Role;
import com.jh.backend.dto.auth.TokenDto;
import com.jh.backend.dto.auth.request.LoginRequestDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.exception.AuthException;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
import com.jh.backend.util.jwt.JwtPayload;
import com.jh.backend.util.jwt.JwtProvider;
import com.jh.backend.util.jwt.RefreshTokenStore;
import com.jh.backend.util.jwt.TokenType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenStore refreshTokenStore;

    // 로그인
    public TokenDto login(LoginRequestDto dto) {
        Admin admin = adminRepository.findByUsername(dto.adminUsername())
                .filter(found -> passwordEncoder.matches(dto.adminPassword(), found.getPassword()))
                .orElseThrow(() -> new CustomException(ExceptionCode.ADMIN_LOGIN_FAILED));

        TokenDto tokens = createTokens(admin.getId());
        refreshTokenStore.save(admin.getId(), tokens.refreshToken());
        return tokens;
    }

    // 토큰 재발급 (Rotation)
    public TokenDto refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthException(ExceptionCode.REFRESH_JWT_EXPIRED);
        }

        Long adminId = jwtProvider.parse(refreshToken, TokenType.REFRESH).id();
        TokenDto tokens = createTokens(adminId);

        if (!adminRepository.existsById(adminId) || !refreshTokenStore.rotate(adminId, refreshToken, tokens.refreshToken())) {
            throw new AuthException(ExceptionCode.REFRESH_JWT_EXPIRED);
        }
        return tokens;
    }

    // 로그아웃 (토큰이 없거나 유효하지 않아도 성공)
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;

        try {
            refreshTokenStore.delete(jwtProvider.parse(refreshToken, TokenType.REFRESH).id(), refreshToken);
        } catch (AuthException ignored) {
            // 이미 만료되었거나 잘못된 토큰은 삭제할 값이 없음
        }
    }

    private TokenDto createTokens(Long adminId) {
        JwtPayload payload = new JwtPayload(adminId, Role.ADMIN);
        return new TokenDto(jwtProvider.createAccessToken(payload), jwtProvider.createRefreshToken(payload));
    }
}

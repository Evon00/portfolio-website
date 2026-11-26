package com.jh.backend.service.implement;

import com.jh.backend.common.enums.Role;
import com.jh.backend.dto.auth.item.TokenItem;
import com.jh.backend.dto.auth.request.LoginRequestDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.exception.AuthException;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
import com.jh.backend.service.AuthService;
import com.jh.backend.util.jwt.JwtPayload;
import com.jh.backend.util.jwt.JwtProvider;
import com.jh.backend.util.jwt.RefreshTokenStore;
import com.jh.backend.util.jwt.TokenType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RefreshTokenStore refreshTokenStore;

    // 관리자 로그인
    @Override
    @Transactional(readOnly = true)
    public TokenItem login(LoginRequestDto dto) {

        // 1. 아이디, 비밀번호 확인
        //      exc. 아이디가 없거나 비밀번호 불일치시 에러 처리 (같은 응답)
        Admin admin = adminRepository.findByUsername(dto.adminUsername())
                .filter(found -> passwordEncoder.matches(dto.adminPassword(), found.getPassword()))
                .orElseThrow(() -> new CustomException(ExceptionCode.ADMIN_LOGIN_FAILED));

        // 2. 토큰 발급 및 Refresh Token 저장
        //      -> 기존 Refresh Token은 덮어씀 (1곳만 로그인 유지)
        TokenItem tokens = createTokens(admin.getId());
        refreshTokenStore.save(admin.getId(), tokens.refreshToken());
        return tokens;
    }

    // 토큰 재발급
    @Override
    @Transactional(readOnly = true)
    public TokenItem refresh(String refreshToken) {

        // 1. Refresh Token 존재 여부 확인
        //      exc. 쿠키 미존재시 에러 처리
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthException(ExceptionCode.REFRESH_JWT_EXPIRED);
        }

        // 2. Refresh Token 검증
        //      exc. 만료, 위조된 토큰 에러 처리
        Long adminId = jwtProvider.parse(refreshToken, TokenType.REFRESH).id();

        // 3. 관리자 확인 및 Refresh Token 교체 (Rotation)
        //      exc. 삭제된 관리자, Redis 저장값과 불일치시 에러 처리
        TokenItem tokens = createTokens(adminId);
        if (!adminRepository.existsById(adminId) || !refreshTokenStore.rotate(adminId, refreshToken, tokens.refreshToken())) {
            throw new AuthException(ExceptionCode.REFRESH_JWT_EXPIRED);
        }
        return tokens;
    }

    // 로그아웃
    @Override
    public void logout(String refreshToken) {

        // 1. Refresh Token 존재 여부 확인
        //      -> 없으면 그대로 성공 처리
        if (refreshToken == null || refreshToken.isBlank()) return;

        // 2. Redis 저장값과 같을 때만 삭제
        //      -> 만료되었거나 잘못된 토큰도 성공 처리
        try {
            refreshTokenStore.delete(jwtProvider.parse(refreshToken, TokenType.REFRESH).id(), refreshToken);
        } catch (AuthException ignored) {
            // 이미 만료되었거나 잘못된 토큰은 삭제할 값이 없음
        }
    }

    private TokenItem createTokens(Long adminId) {
        JwtPayload payload = new JwtPayload(adminId, Role.ADMIN);
        return new TokenItem(jwtProvider.createAccessToken(payload), jwtProvider.createRefreshToken(payload));
    }
}

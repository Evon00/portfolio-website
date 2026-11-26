package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.auth.item.TokenItem;
import com.jh.backend.dto.auth.request.LoginRequestDto;
import com.jh.backend.dto.auth.response.LoginResponseDto;
import com.jh.backend.dto.auth.response.RefreshResponseDto;
import com.jh.backend.service.AuthService;
import com.jh.backend.swagger.auth.LoginSwaggerDocs;
import com.jh.backend.swagger.auth.LogoutSwaggerDocs;
import com.jh.backend.swagger.auth.RefreshSwaggerDocs;
import com.jh.backend.util.cookie.CookieUtil;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "인증", description = "관리자 로그인, 토큰 재발급, 로그아웃 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    // 관리자 로그인
    @LoginSwaggerDocs
    @PostMapping("/login")
    public ResponseEntity<CommonApiResponse<LoginResponseDto>> login(@Valid @RequestBody LoginRequestDto dto) {
        TokenItem tokens = authService.login(dto);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.createRefreshCookie(tokens.refreshToken()).toString())
                .body(CommonApiResponse.ok(LoginResponseDto.from(tokens)));
    }

    // 토큰 재발급
    @RefreshSwaggerDocs
    @PostMapping("/refresh")
    public ResponseEntity<CommonApiResponse<RefreshResponseDto>> refresh(
            @Parameter(hidden = true) @CookieValue(name = CookieUtil.REFRESH_TOKEN, required = false) String refreshToken) {
        TokenItem tokens = authService.refresh(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.createRefreshCookie(tokens.refreshToken()).toString())
                .body(CommonApiResponse.ok(RefreshResponseDto.from(tokens)));
    }

    // 로그아웃
    @LogoutSwaggerDocs
    @PostMapping("/logout")
    public ResponseEntity<CommonApiResponse<Void>> logout(
            @Parameter(hidden = true) @CookieValue(name = CookieUtil.REFRESH_TOKEN, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieUtil.expireRefreshCookie().toString())
                .body(CommonApiResponse.ok());
    }
}

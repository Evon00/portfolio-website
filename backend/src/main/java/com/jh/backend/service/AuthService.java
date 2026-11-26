package com.jh.backend.service;

import com.jh.backend.dto.auth.item.TokenItem;
import com.jh.backend.dto.auth.request.LoginRequestDto;

public interface AuthService {

    // 관리자 로그인
    TokenItem login(LoginRequestDto dto);

    // 토큰 재발급
    TokenItem refresh(String refreshToken);

    // 로그아웃
    void logout(String refreshToken);
}

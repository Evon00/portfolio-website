package com.jh.backend.util.jwt;

import com.jh.backend.exception.ExceptionCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

// 토큰 종류 및 검증 실패시 에러 코드
@Getter
@AllArgsConstructor
public enum TokenType {
    ACCESS(ExceptionCode.JWT_EXPIRED, ExceptionCode.JWT_INVALID),
    REFRESH(ExceptionCode.REFRESH_JWT_EXPIRED, ExceptionCode.REFRESH_JWT_INVALID);

    private final ExceptionCode expired;
    private final ExceptionCode invalid;
}

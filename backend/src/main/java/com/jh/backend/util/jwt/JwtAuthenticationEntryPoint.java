package com.jh.backend.util.jwt;

import com.jh.backend.exception.AuthException;
import com.jh.backend.exception.ExceptionCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

// 401 응답 (만료, 잘못된 토큰 구분)
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final HandlerExceptionResolver handlerExceptionResolver;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) {
        AuthException exception = request.getAttribute(JwtFilter.AUTH_ERROR) instanceof AuthException authError
                ? authError
                : new AuthException(ExceptionCode.JWT_INVALID);
        handlerExceptionResolver.resolveException(request, response, null, exception);
    }
}

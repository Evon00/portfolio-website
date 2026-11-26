package com.jh.backend.util.login;

import com.jh.backend.exception.AuthException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.util.jwt.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/*
로그인 정보 확인
- 권한은 SecurityConfig에서 확인하므로, 로그인한 관리자 PK만 반환합니다.
 */
@Component
public class LoginChecker {

    public Long getAdminId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AuthException(ExceptionCode.JWT_INVALID);
        }
        return userDetails.jwtPayload().id();
    }
}

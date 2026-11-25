package com.jh.backend.swagger.auth;

import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.common.annotation.JwtNotRequired;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.Operation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@JwtNotRequired
@Operation(
        summary = "관리자 로그인",
        description = """
                관리자 아이디와 비밀번호로 로그인합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `adminUsername` | `String` | ✅ | 관리자 아이디 |
                | `adminPassword` | `String` | ✅ | 관리자 비밀번호 |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `accessToken` | `String` | Access Token (15분) |

                Refresh Token은 `refreshToken` HttpOnly 쿠키로 전달됩니다. (14일)
                """
)
@ApiExceptionDocs({ExceptionCode.VALID_ERROR, ExceptionCode.NOT_READABLE_JSON, ExceptionCode.ADMIN_LOGIN_FAILED, ExceptionCode.TOO_MANY_REQUESTS})
public @interface LoginSwaggerDocs {
}

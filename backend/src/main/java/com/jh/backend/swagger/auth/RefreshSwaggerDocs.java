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
        summary = "토큰 재발급",
        description = """
                `refreshToken` 쿠키로 Access Token을 재발급합니다.

                - Access Token은 필요하지 않습니다.
                - Refresh Token도 함께 교체되며, 이전 Refresh Token은 사용할 수 없습니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `accessToken` | `String` | Access Token (15분) |

                Refresh Token은 `refreshToken` HttpOnly 쿠키로 전달됩니다. (14일)
                """
)
@ApiExceptionDocs({ExceptionCode.REFRESH_JWT_EXPIRED, ExceptionCode.REFRESH_JWT_INVALID, ExceptionCode.TOO_MANY_REQUESTS})
public @interface RefreshSwaggerDocs {
}

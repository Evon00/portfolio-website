package com.jh.backend.common.annotation;

import com.jh.backend.exception.ExceptionCode;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/*
401, 403에 대한 에러 Swagger Docs
- GlobalExceptionHandler에서 인증 관련 오류에 대한 Swagger 예시입니다.
- @JwtNotRequired가 없는 모든 API에 표시됩니다.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@ApiExceptionDocs({
        ExceptionCode.JWT_EXPIRED,
        ExceptionCode.JWT_INVALID,
        ExceptionCode.JWT_ROLE_DENIED
})
public @interface AuthExceptionSwaggerDocs {
}

package com.jh.backend.swagger.auth;

import com.jh.backend.common.annotation.JwtNotRequired;
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
        summary = "로그아웃",
        description = """
                Refresh Token을 삭제하고 쿠키를 만료시킵니다.

                - Access Token은 필요하지 않습니다.
                - 쿠키가 없거나 이미 만료된 토큰이어도 200을 반환합니다.
                """
)
public @interface LogoutSwaggerDocs {
}

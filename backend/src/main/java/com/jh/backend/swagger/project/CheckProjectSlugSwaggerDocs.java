package com.jh.backend.swagger.project;

import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Operation(
        summary = "프로젝트 슬러그 중복 확인",
        description = """
                관리자가 프로젝트 작성 화면에서 슬러그 사용 가능 여부를 확인합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `projectSlug` | `String` | ✅ | 확인할 슬러그 (Query, 최대 100자, 영문 소문자·숫자·하이픈) |

                - 하이픈으로 시작하거나 끝나거나 연속될 수 없습니다.
                - 형식이 올바르지 않으면 400으로 응답합니다.
                - 중복이어도 200으로 응답하며, `available`로 사용 가능 여부를 전달합니다.
                - 삭제된 프로젝트의 슬러그는 사용 가능으로 판단합니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `projectSlug` | `String` | 확인한 슬러그 |
                | `available` | `Boolean` | 사용 가능 여부 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR
})
public @interface CheckProjectSlugSwaggerDocs {
}

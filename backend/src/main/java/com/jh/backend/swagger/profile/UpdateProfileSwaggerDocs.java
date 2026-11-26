package com.jh.backend.swagger.profile;

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
        summary = "프로필 수정",
        description = """
                관리자가 프로필의 이름, 소개, GitHub 주소, 이메일을 수정합니다.

                PATCH 방식으로, 보낸 필드만 수정하고 보내지 않거나 null인 필드는 기존 값을 유지합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `adminName` | `String` | ❌ | 관리자 이름 (최대 10자, 보내면 공백 불가) |
                | `adminDescription` | `String` | ❌ | 관리자 소개 (최대 200자, 보내면 공백 불가) |
                | `adminGithubUrl` | `String` | ❌ | GitHub 주소 (https URL, 최대 300자) |
                | `adminEmail` | `String` | ❌ | 이메일 (최대 300자) |

                - 모든 값의 앞뒤 공백은 제거하고 저장합니다.
                - GitHub 주소, 이메일은 빈 문자열(`""`)을 보내면 값을 비웁니다.
                - 수정하면 프로필 조회 캐시가 갱신됩니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `adminName` | `String` | 관리자 이름 |
                | `adminDescription` | `String` | 관리자 소개 |
                | `adminGithubUrl` | `String` | GitHub 주소 (없으면 null) |
                | `adminEmail` | `String` | 이메일 (없으면 null) |
                | `adminProfileUrl` | `String` | 프로필 이미지 URL (없으면 null) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.ADMIN_NOT_FOUND
})
public @interface UpdateProfileSwaggerDocs {
}

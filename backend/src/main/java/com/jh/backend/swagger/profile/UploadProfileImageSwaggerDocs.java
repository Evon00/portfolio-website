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
        summary = "프로필 이미지 업로드",
        description = """
                관리자가 프로필 이미지를 업로드합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `file` | `MultipartFile` | ✅ | 프로필 이미지 (JPG, PNG, GIF, WEBP / 10MB 이하) |

                - 기존 이미지가 있으면 교체하고, 기존 이미지 파일은 삭제됩니다.
                - 업로드하면 프로필 조회 캐시가 갱신됩니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `adminProfileUrl` | `String` | 프로필 이미지 URL |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.FILE_REQUIRED,
        ExceptionCode.FILE_TYPE_INVALID,
        ExceptionCode.FILE_SIZE_EXCEED,
        ExceptionCode.ADMIN_NOT_FOUND,
        ExceptionCode.API_BAD_GATEWAY
})
public @interface UploadProfileImageSwaggerDocs {
}

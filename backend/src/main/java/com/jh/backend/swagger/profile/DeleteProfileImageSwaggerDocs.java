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
        summary = "프로필 이미지 삭제",
        description = """
                관리자가 프로필 이미지를 삭제합니다.

                - 이미지 파일은 삭제되고, 프로필 조회의 `adminProfileUrl`은 null이 됩니다.
                - 등록된 이미지가 없어도 성공으로 응답합니다.
                - 삭제하면 프로필 조회 캐시가 갱신됩니다.
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.ADMIN_NOT_FOUND
})
public @interface DeleteProfileImageSwaggerDocs {
}

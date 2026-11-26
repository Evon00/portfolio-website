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
        summary = "프로젝트 삭제",
        description = """
                관리자가 프로젝트를 삭제합니다. (soft delete)

                - 갤러리 이미지도 함께 soft delete 합니다. (이미지 파일은 유지)
                - 프로젝트 기술 스택은 유지합니다.
                - 남은 프로젝트의 순서를 1부터 다시 매겨 뒤 프로젝트들을 앞으로 당깁니다.
                - 삭제된 프로젝트의 슬러그는 새 프로젝트에서 다시 사용할 수 있습니다.
                - 이미 삭제된 프로젝트는 삭제할 수 없습니다. (404)

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `projectId` | `Long` | ✅ | 프로젝트 PK (Path) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.PROJECT_NOT_FOUND
})
public @interface DeleteProjectSwaggerDocs {
}

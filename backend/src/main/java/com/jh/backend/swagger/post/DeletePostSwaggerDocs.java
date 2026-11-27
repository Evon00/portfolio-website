package com.jh.backend.swagger.post;

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
        summary = "게시글 삭제",
        description = """
                관리자가 게시글을 삭제합니다. (soft delete)

                - 게시글에 연결된 이미지도 함께 soft delete 합니다. (이미지 파일은 유지)
                - 게시글 기술 스택, 조회 로그는 유지합니다.
                - 삭제된 게시글의 슬러그는 새 게시글에서 다시 사용할 수 있습니다.
                - 이미 삭제된 게시글은 삭제할 수 없습니다. (404)

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `postId` | `Long` | ✅ | 게시글 PK (Path) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.POST_NOT_FOUND
})
public @interface DeletePostSwaggerDocs {
}

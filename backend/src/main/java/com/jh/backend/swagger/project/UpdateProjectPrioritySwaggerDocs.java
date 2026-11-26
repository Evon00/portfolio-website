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
        summary = "프로젝트 순서 변경",
        description = """
                관리자가 프로젝트를 원하는 위치로 옮깁니다.

                - 위치는 페이지와 관계없이 전체 목록 기준입니다. (1부터, 프로젝트 수 이하)
                - 사이에 있는 프로젝트는 한 칸씩 밀리거나 당겨집니다.
                - 이동 후 전체 프로젝트의 순서를 1부터 다시 매기므로, 삭제로 생긴 빈 번호도 함께 정리됩니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `projectId` | `Long` | ✅ | 이동할 프로젝트 PK (Path) |
                | `projectPriority` | `Integer` | ✅ | 이동할 위치 (1 이상, 프로젝트 수 이하) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `projectId` | `Long` | 프로젝트 PK |
                | `projectPriority` | `Integer` | 변경된 프로젝트 순서 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.PROJECT_PRIORITY_OUT_OF_RANGE,
        ExceptionCode.PROJECT_NOT_FOUND
})
public @interface UpdateProjectPrioritySwaggerDocs {
}

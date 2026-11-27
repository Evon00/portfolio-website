package com.jh.backend.swagger.skill;

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
        summary = "기술 스택 삭제",
        description = """
                관리자가 기술 스택을 삭제합니다. (soft delete, 아이콘 파일은 유지)

                게시글, 프로젝트, 관리자 프로필 중 한 곳에서라도 사용 중이면 삭제할 수 없습니다.
                (삭제된 게시글, 프로젝트의 연결은 사용 중으로 보지 않습니다.)

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `skillId` | `Long` | ✅ | 기술 스택 PK (Path) |

                ---

                ## Response (409 SKILL_001)
                사용 중이어서 삭제할 수 없으면 `data`에 사용처 정보를 함께 반환합니다.

                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `postCount` | `long` | 사용 중인 게시글 수 |
                | `projectCount` | `long` | 사용 중인 프로젝트 수 |
                | `profileUsed` | `boolean` | 관리자 프로필 사용 여부 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.SKILL_NOT_FOUND,
        ExceptionCode.SKILL_IN_USE
})
public @interface DeleteSkillSwaggerDocs {
}

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
        summary = "기술 스택 추가",
        description = """
                관리자가 기술 스택을 추가합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `skillName` | `String` | ✅ | 기술 스택 이름 (최대 100자, 대소문자 무시 중복 불가) |
                | `skillCategory` | `String` | ✅ | 기술 스택 카테고리 (최대 100자, 예: Backend) |
                | `file` | `MultipartFile` | ✅ | 아이콘 (JPG, PNG, GIF, WEBP, SVG / 10MB 이하, 1:1 권장) |

                이름, 카테고리의 앞뒤 공백은 제거하고 저장합니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `skillId` | `Long` | 기술 스택 PK |
                | `skillName` | `String` | 기술 스택 이름 |
                | `skillCategory` | `String` | 기술 스택 카테고리 |
                | `skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `createdAt` | `OffsetDateTime` | 생성일 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.FILE_REQUIRED,
        ExceptionCode.FILE_TYPE_INVALID,
        ExceptionCode.FILE_SIZE_EXCEED,
        ExceptionCode.SKILL_NAME_DUPLICATED,
        ExceptionCode.API_BAD_GATEWAY
})
public @interface CreateSkillSwaggerDocs {
}

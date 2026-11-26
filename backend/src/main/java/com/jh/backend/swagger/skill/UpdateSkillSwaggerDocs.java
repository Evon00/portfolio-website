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
        summary = "기술 스택 수정",
        description = """
                관리자가 기술 스택의 이름, 카테고리, 아이콘을 수정합니다.

                PATCH 방식으로, 보낸 값만 수정하고 `data` 파트나 필드를 보내지 않으면 기존 값을 유지합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `skillId` | `Long` | ✅ | 기술 스택 PK (Path) |
                | `skillName` | `String` | ❌ | 기술 스택 이름 (최대 100자, 보내면 공백 불가, 다른 기술 스택과 대소문자 무시 중복 불가) |
                | `skillCategory` | `String` | ❌ | 기술 스택 카테고리 (최대 100자, 보내면 공백 불가) |
                | `file` | `MultipartFile` | ❌ | 새 아이콘 (JPG, PNG, GIF, WEBP, SVG / 10MB 이하) |

                - 이름, 카테고리의 앞뒤 공백은 제거하고 저장합니다.
                - 파일을 보내지 않거나 빈 파일이면 기존 아이콘을 유지합니다.
                - 아이콘을 교체하면 기존 아이콘 파일은 삭제됩니다.

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
        ExceptionCode.FILE_TYPE_INVALID,
        ExceptionCode.FILE_SIZE_EXCEED,
        ExceptionCode.SKILL_NOT_FOUND,
        ExceptionCode.SKILL_NAME_DUPLICATED,
        ExceptionCode.API_BAD_GATEWAY
})
public @interface UpdateSkillSwaggerDocs {
}

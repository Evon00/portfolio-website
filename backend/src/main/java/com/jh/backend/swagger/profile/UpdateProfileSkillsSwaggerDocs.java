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
        summary = "핵심 기술 스택 수정 (전체 교체)",
        description = """
                관리자가 메인 CORE STACK 영역에 보일 핵심 기술 스택을 전체 교체합니다.

                드래그로 순서만 바꿀 때도 이 API를 사용합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `skillIds` | `Long[]` | ✅ | 기술 스택 PK 목록 (배열 순서 = 노출 순서, 최대 20개) |

                - 기존 핵심 기술 스택을 모두 지우고 배열 순서대로 `adminSkillPriority` 1부터 다시 저장합니다.
                - 빈 배열을 보내면 핵심 기술 스택을 모두 비웁니다.
                - 중복된 PK가 있으면 `SKILL_004`로 실패합니다.
                - 존재하지 않거나 삭제된 PK가 있으면 `SKILL_005`로 실패하고, `data.skillIds`에 해당 PK 목록을 담습니다.
                - 수정하면 프로필 조회 캐시가 갱신됩니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `skills[].skillId` | `Long` | 기술 스택 PK |
                | `skills[].skillName` | `String` | 기술 스택 이름 |
                | `skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `skills[].adminSkillPriority` | `Integer` | 핵심 기술 스택 순서 (오름차순 정렬) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.SKILL_ID_DUPLICATED,
        ExceptionCode.SKILL_ID_INVALID,
        ExceptionCode.ADMIN_NOT_FOUND
})
public @interface UpdateProfileSkillsSwaggerDocs {
}

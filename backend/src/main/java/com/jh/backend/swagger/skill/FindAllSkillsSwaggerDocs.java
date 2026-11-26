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
        summary = "기술 스택 목록 조회",
        description = """
                관리자가 기술 스택 목록을 조회합니다. (등록일 내림차순, 페이징 없음)

                기술 스택 관리 화면, 게시글·프로젝트 작성 화면의 기술 칩 목록, 프로필 화면의 스킬 검색에서 공통으로 사용합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `skillCategory` | `String` | ❌ | 카테고리 필터 (정확히 일치, 최대 100자, 없으면 전체) |
                | `keyword` | `String` | ❌ | 이름 검색어 (부분 일치, 대소문자 무시, 최대 100자) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `totalCount` | `int` | 조회된 기술 스택 수 |
                | `skills[].skillId` | `Long` | 기술 스택 PK |
                | `skills[].skillName` | `String` | 기술 스택 이름 |
                | `skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `skills[].createdAt` | `OffsetDateTime` | 생성일 |

                조건에 맞는 기술 스택이 없으면 `totalCount: 0`, `skills: []`를 반환합니다.
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR
})
public @interface FindAllSkillsSwaggerDocs {
}

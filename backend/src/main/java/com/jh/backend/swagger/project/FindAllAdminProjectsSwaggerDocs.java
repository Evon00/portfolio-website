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
        summary = "관리자 프로젝트 목록 조회",
        description = """
                관리자 화면의 프로젝트 목록을 페이지 단위로 조회합니다.

                ---

                ## Request (Query)
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `pageNumber` | `Integer` | ❌ | 페이지 번호 (0부터, 기본 0) |
                | `pageSize` | `Integer` | ❌ | 페이지 크기 (1~50, 기본 10) |

                - `projectPriority` 오름차순으로 정렬하며, 같으면 PK 오름차순으로 정렬합니다.
                - 삭제된 프로젝트, 삭제된 이미지는 제외합니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `pageNumber` | `Integer` | 현재 페이지 번호 |
                | `pageSize` | `Integer` | 현재 페이지 크기 |
                | `isFirst` | `Boolean` | 첫 페이지 여부 |
                | `isLast` | `Boolean` | 마지막 페이지 여부 |
                | `totalPages` | `Integer` | 총 페이지 수 |
                | `totalElements` | `Long` | 총 프로젝트 수 |
                | `content[].projectId` | `Long` | 프로젝트 PK |
                | `content[].projectTitle` | `String` | 프로젝트 제목 |
                | `content[].projectSlug` | `String` | 프로젝트 슬러그 |
                | `content[].projectStartDate` | `LocalDate` | 시작일 |
                | `content[].projectEndDate` | `LocalDate` | 종료일 (진행 중이면 null) |
                | `content[].projectPriority` | `Integer` | 프로젝트 순서 |
                | `content[].projectMediaCount` | `Long` | 갤러리 이미지 수 (0이면 없음) |
                | `content[].skills[].skillId` | `Long` | 기술 스택 PK |
                | `content[].skills[].skillName` | `String` | 기술 스택 이름 |
                | `content[].skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `content[].skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `content[].skills[].projectSkillPriority` | `Integer` | 프로젝트 기술 스택 순서 (오름차순 정렬) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR
})
public @interface FindAllAdminProjectsSwaggerDocs {
}

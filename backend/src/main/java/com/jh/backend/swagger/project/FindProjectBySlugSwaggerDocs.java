package com.jh.backend.swagger.project;

import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.Operation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Operation(
        summary = "프로젝트 상세 조회 (슬러그)",
        description = """
                방문자에게 보여줄 프로젝트 상세 정보를 슬러그로 조회합니다. (인증 불필요)

                - 본문은 저장된 마크다운 원문 그대로 반환합니다.
                - 삭제된 프로젝트는 조회할 수 없고, 삭제된 이미지는 제외합니다.
                - 형식이 틀린 슬러그도 프로젝트가 없으므로 404를 반환합니다.
                - 원본 파일명, 파일 크기는 응답하지 않습니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `projectSlug` | `String` | ✅ | 프로젝트 슬러그 (Path) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `projectId` | `Long` | 프로젝트 PK |
                | `projectTitle` | `String` | 제목 |
                | `projectSummary` | `String` | 요약 |
                | `projectContent` | `String` | 본문 (마크다운 원문) |
                | `projectSlug` | `String` | 슬러그 |
                | `projectStartDate` | `LocalDate` | 시작일 |
                | `projectEndDate` | `LocalDate` | 종료일 (진행 중이면 null) |
                | `projectGithubUrl` | `String` | GitHub 주소 (없으면 null) |
                | `projectGithubIsPublic` | `Boolean` | 레포지토리 공개 여부 (false면 자물쇠 표시) |
                | `projectUrl` | `String` | 사이트 주소 (없으면 null) |
                | `skills[].skillId` | `Long` | 기술 스택 PK |
                | `skills[].skillName` | `String` | 기술 스택 이름 |
                | `skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `skills[].projectSkillPriority` | `Integer` | 프로젝트 기술 스택 순서 (오름차순 정렬) |
                | `projectMedias[].projectMediaId` | `Long` | 프로젝트 이미지 PK |
                | `projectMedias[].projectMediaUrl` | `String` | 이미지 URL |
                | `projectMedias[].projectMediaCaption` | `String` | 이미지 설명 (없으면 null) |
                | `projectMedias[].projectMediaIsImportant` | `Boolean` | 대표 이미지 여부 |
                | `projectMedias[].projectMediaPriority` | `Integer` | 이미지 순서 (오름차순 정렬) |
                """
)
@ApiExceptionDocs({
        ExceptionCode.PROJECT_NOT_FOUND
})
public @interface FindProjectBySlugSwaggerDocs {
}

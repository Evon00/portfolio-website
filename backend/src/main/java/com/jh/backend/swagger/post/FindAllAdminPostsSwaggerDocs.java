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
        summary = "관리자 게시글 목록 조회",
        description = """
                관리자 화면의 게시글 목록을 페이지 단위로 조회합니다.

                ---

                ## Request (Query)
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `pageNumber` | `Integer` | ❌ | 페이지 번호 (0부터, 기본 0) |
                | `pageSize` | `Integer` | ❌ | 페이지 크기 (1~50, 기본 10) |
                | `sortBy` | `String` | ❌ | 정렬 기준 (`createdAt` : 등록일, `postView` : 조회수, 기본 `createdAt`) |
                | `sortDir` | `String` | ❌ | 정렬 방향 (`asc`, `desc`, 기본 `desc`) |
                | `keywordType` | `String` | ❌ | 검색 종류 (`TITLE`, `CONTENT`, `TITLE_CONTENT`, `SKILL`) |
                | `keyword` | `String` | ❌ | 검색어 (최대 100자, 부분 일치, 대소문자 무시) |

                - 검색어 없이 검색 종류만 보내면 검색하지 않습니다.
                - 검색 종류 없이 검색어만 보내면 제목+내용(`TITLE_CONTENT`)으로 검색합니다.
                - `SKILL`은 기술 스택 이름으로 검색합니다.
                - 정렬 값이 같으면 PK를 같은 방향으로 정렬합니다.
                - 조회해도 조회수는 증가하지 않습니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `pageNumber` | `Integer` | 현재 페이지 번호 |
                | `pageSize` | `Integer` | 현재 페이지 크기 |
                | `isFirst` | `Boolean` | 첫 페이지 여부 |
                | `isLast` | `Boolean` | 마지막 페이지 여부 |
                | `totalPages` | `Integer` | 총 페이지 수 |
                | `totalElements` | `Long` | 총 게시글 수 |
                | `content[].postId` | `Long` | 게시글 PK |
                | `content[].postTitle` | `String` | 게시글 제목 |
                | `content[].postSlug` | `String` | 게시글 슬러그 |
                | `content[].postView` | `Long` | 조회수 |
                | `content[].postModifiedAt` | `OffsetDateTime` | 본문 수정일 (수정 전이면 null) |
                | `content[].createdAt` | `OffsetDateTime` | 등록일 |
                | `content[].skills[].skillId` | `Long` | 기술 스택 PK |
                | `content[].skills[].skillName` | `String` | 기술 스택 이름 |
                | `content[].skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `content[].skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `content[].skills[].postSkillPriority` | `Integer` | 게시글 기술 스택 순서 (오름차순 정렬) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR
})
public @interface FindAllAdminPostsSwaggerDocs {
}

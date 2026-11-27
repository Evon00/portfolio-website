package com.jh.backend.swagger.post;

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
        summary = "게시글 상세 조회 (슬러그)",
        description = """
                방문자가 슬러그로 게시글 상세를 조회합니다. (인증 불필요)

                - 같은 IP가 24시간 안에 처음 조회하면 조회수가 1 증가하고, 조회 로그(IP, User-Agent)를 기록합니다.
                - 24시간 안에 다시 조회하면 조회수, 조회 로그 모두 변경되지 않습니다.
                - 조회수가 증가해도 본문 수정일(`postModifiedAt`)은 바뀌지 않습니다.
                - 삭제됐거나 존재하지 않는 슬러그는 404입니다. (형식이 틀린 슬러그 포함)

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `postSlug` | `String` | ✅ | 게시글 슬러그 (Path) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `postId` | `Long` | 게시글 PK |
                | `postTitle` | `String` | 게시글 제목 |
                | `postSummary` | `String` | 게시글 요약 |
                | `postContent` | `String` | 게시글 본문 (마크다운 원문) |
                | `postSlug` | `String` | 게시글 슬러그 |
                | `postThumbnailUrl` | `String` | 썸네일 URL (본문 첫 번째 업로드 이미지, 없으면 null) |
                | `postView` | `Long` | 조회수 (이번 조회 반영) |
                | `postModifiedAt` | `OffsetDateTime` | 본문 수정일 (수정 전이면 null) |
                | `createdAt` | `OffsetDateTime` | 등록일 |
                | `skills[].skillId` | `Long` | 기술 스택 PK |
                | `skills[].skillName` | `String` | 기술 스택 이름 |
                | `skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `skills[].postSkillPriority` | `Integer` | 게시글 기술 스택 순서 (오름차순 정렬) |
                """
)
@ApiExceptionDocs({
        ExceptionCode.POST_NOT_FOUND
})
public @interface FindPostBySlugSwaggerDocs {
}

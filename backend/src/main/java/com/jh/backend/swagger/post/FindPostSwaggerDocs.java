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
        summary = "게시글 상세 조회 (수정용)",
        description = """
                관리자가 게시글을 수정하기 위해 상세 정보를 조회합니다.

                - 조회해도 조회수는 증가하지 않고, 조회 로그도 남지 않습니다.
                - 본문은 저장된 마크다운 원문 그대로 반환합니다.
                - 삭제된 게시글은 조회할 수 없습니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `postId` | `Long` | ✅ | 게시글 PK (Path) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `postId` | `Long` | 게시글 PK |
                | `postTitle` | `String` | 게시글 제목 |
                | `postSlug` | `String` | 게시글 슬러그 |
                | `postSummary` | `String` | 게시글 요약 |
                | `postContent` | `String` | 게시글 본문 (마크다운 원문) |
                | `skills[].skillId` | `Long` | 기술 스택 PK |
                | `skills[].skillName` | `String` | 기술 스택 이름 |
                | `skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `skills[].postSkillPriority` | `Integer` | 게시글 기술 스택 순서 (오름차순 정렬) |
                | `postMedias[].postMediaId` | `Long` | 게시글 이미지 PK |
                | `postMedias[].postMediaUrl` | `String` | 게시글 이미지 URL |
                | `postMedias[].postMediaCaption` | `String` | 이미지 캡션 (없으면 null) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.POST_NOT_FOUND
})
public @interface FindPostSwaggerDocs {
}

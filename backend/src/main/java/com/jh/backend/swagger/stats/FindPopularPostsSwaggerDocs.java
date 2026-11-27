package com.jh.backend.swagger.stats;

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
        summary = "인기 게시글 통계",
        description = """
                조회수 기준 상위 게시글을 조회합니다.

                - 조회수 내림차순으로 정렬하며, 같으면 PK 내림차순(최신 글 먼저)으로 정렬합니다.
                - `rank`는 정렬 순서대로 1부터 매기며, 동점이어도 다른 순위입니다.
                - 삭제된 게시글은 제외하고, 조회수 0인 게시글은 포함합니다.
                - 막대 길이는 프론트에서 1위 조회수 대비 비율로 계산합니다.

                ---

                ## Request (Query)
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `limit` | `Integer` | ❌ | 조회 개수 (1~20, 기본 5) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `posts[].rank` | `Integer` | 순위 |
                | `posts[].postId` | `Long` | 게시글 PK |
                | `posts[].postTitle` | `String` | 게시글 제목 |
                | `posts[].postSlug` | `String` | 게시글 슬러그 |
                | `posts[].postView` | `Long` | 조회수 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR
})
public @interface FindPopularPostsSwaggerDocs {
}

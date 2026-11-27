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
        summary = "게시글 수정",
        description = """
                관리자가 게시글을 수정합니다. (PATCH, 보낸 필드만 수정)

                - 보내지 않은 필드(null)는 기존 값을 유지합니다.
                - 슬러그는 수정할 수 없습니다. (요청에 포함해도 무시)
                - `postMediaIds`에는 연결되지 않은 이미지나 이 게시글에 이미 연결된 이미지만 사용할 수 있습니다.
                - `postMediaIds`에서 빠진 기존 이미지는 연결 해제되고, 이후 스케줄러가 정리합니다.
                - 본문이나 이미지 목록이 바뀌면 썸네일, 캡션을 최종 본문 기준으로 다시 계산합니다.
                - 실제로 바뀐 값이 있을 때만 수정일자(`postModifiedAt`)를 갱신합니다.
                - 조회수는 변경하지 않습니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `postId` | `Long` | ✅ | 게시글 PK (Path) |
                | `postTitle` | `String` | ❌ | 게시글 제목 (최대 100자, 공백 불가) |
                | `postSummary` | `String` | ❌ | 게시글 요약 (최대 200자, 공백 불가) |
                | `postContent` | `String` | ❌ | 게시글 본문 (마크다운, 최대 100,000자, 공백 불가) |
                | `skillIds` | `List<Long>` | ❌ | 기술 스택 PK 목록 (보내면 전체 교체, 1~20개, 배열 순서 = 노출 순서) |
                | `postMediaIds` | `List<Long>` | ❌ | 본문에 남아 있는 게시글 이미지 PK 전체 (최대 50개, 빈 배열이면 모두 해제) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `postId` | `Long` | 게시글 PK |
                | `postSlug` | `String` | 게시글 슬러그 |

                ---

                ## Response (400 SKILL_005, POST_004)
                사용할 수 없는 ID가 있으면 `data`에 해당 ID 목록을 함께 반환합니다.

                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `skillIds` | `List<Long>` | 존재하지 않거나 삭제된 기술 스택 PK (SKILL_005) |
                | `postMediaIds` | `List<Long>` | 존재하지 않거나 삭제됐거나 다른 게시글에 연결된 이미지 PK (POST_004) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.SKILL_ID_DUPLICATED,
        ExceptionCode.SKILL_ID_INVALID,
        ExceptionCode.POST_MEDIA_DUPLICATED,
        ExceptionCode.POST_MEDIA_INVALID,
        ExceptionCode.POST_NOT_FOUND
})
public @interface UpdatePostSwaggerDocs {
}

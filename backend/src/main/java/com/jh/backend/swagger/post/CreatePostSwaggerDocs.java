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
        summary = "게시글 추가",
        description = """
                관리자가 게시글을 추가합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `postTitle` | `String` | ✅ | 제목 (최대 100자) |
                | `postSlug` | `String` | ✅ | 슬러그 (최대 100자, 영문 소문자·숫자·하이픈, 등록 후 변경 불가) |
                | `postSummary` | `String` | ✅ | 요약 (최대 200자) |
                | `postContent` | `String` | ✅ | 마크다운 본문 (최대 100,000자) |
                | `skillIds` | `Long[]` | ✅ | 기술 스택 PK 목록 (1개 이상 최대 20개, 배열 순서 = 태그 노출 순서) |
                | `postMediaIds` | `Long[]` | ❌ | 이미지 업로드 API로 받은 게시글 이미지 PK 목록 (최대 50개) |

                - 제목, 요약의 앞뒤 공백은 제거하고 저장합니다. 본문은 그대로 저장합니다.
                - 본문 이미지 중 `postMediaIds`의 이미지와 처음 일치하는 이미지가 썸네일이 됩니다. 없으면 썸네일은 null입니다.
                - 각 이미지의 alt 값이 캡션으로 저장됩니다. (최대 50자)
                - 이미 다른 게시글에 연결된 이미지는 사용할 수 없습니다. (`POST_004`, `data.postMediaIds`)
                - 존재하지 않는 기술 스택이 있으면 `SKILL_005`로 실패하고, `data.skillIds`에 해당 PK 목록을 담습니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `postId` | `Long` | 게시글 PK |
                | `postSlug` | `String` | 게시글 슬러그 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.ADMIN_NOT_FOUND,
        ExceptionCode.POST_SLUG_DUPLICATED,
        ExceptionCode.SKILL_ID_DUPLICATED,
        ExceptionCode.SKILL_ID_INVALID,
        ExceptionCode.POST_MEDIA_DUPLICATED,
        ExceptionCode.POST_MEDIA_INVALID,
        ExceptionCode.DATA_INTEGRITY_VIOLATION
})
public @interface CreatePostSwaggerDocs {
}

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
        summary = "기술 스택 비율 통계",
        description = """
                블로그 게시글 또는 프로젝트의 기술 스택 사용 비율을 조회합니다. (도넛 차트)

                - 삭제된 게시글·프로젝트의 태그는 제외합니다.
                - 사용 수 내림차순으로 정렬하며, 같으면 skillId 오름차순으로 정렬합니다.
                - 상위 `limit`개를 제외한 나머지는 `etc`로 합칩니다. (나머지가 없으면 count 0, ratio 0)
                - `ratio`는 정수 퍼센트이며, 최대 나머지 방식으로 items + etc 합계가 정확히 100입니다. (태그가 없으면 모두 0)

                ---

                ## Request (Query)
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `type` | `String` | ✅ | 집계 대상 (POST, PROJECT) |
                | `limit` | `Integer` | ❌ | 상위 개수 (1~20, 기본 5) |

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `type` | `String` | 집계 대상 |
                | `totalCount` | `Long` | 전체 태그 수 (도넛 가운데 숫자) |
                | `items[].skillId` | `Long` | 기술 스택 PK |
                | `items[].skillName` | `String` | 기술 스택 이름 |
                | `items[].count` | `Long` | 사용 수 |
                | `items[].ratio` | `Integer` | 비율 (정수 퍼센트) |
                | `etc.count` | `Long` | 기타 사용 수 |
                | `etc.ratio` | `Integer` | 기타 비율 (정수 퍼센트) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR
})
public @interface FindSkillStatsSwaggerDocs {
}

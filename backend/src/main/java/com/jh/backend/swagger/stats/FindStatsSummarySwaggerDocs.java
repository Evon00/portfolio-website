package com.jh.backend.swagger.stats;

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
        summary = "통계 요약 (대시보드)",
        description = """
                관리자 대시보드 상단 카드 4개의 수치를 조회합니다.

                - 삭제된 게시글·프로젝트는 제외합니다. (조회수 합계도 삭제된 게시글 제외)
                - `avgViews`는 totalViews / totalPosts를 반올림한 값이며, 게시글이 없으면 0입니다.

                ---

                ## Request
                파라미터 없음

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `totalPosts` | `Long` | 전체 게시글 수 |
                | `totalProjects` | `Long` | 전체 프로젝트 수 |
                | `totalViews` | `Long` | 전체 조회수 |
                | `avgViews` | `Long` | 게시글당 평균 조회수 (반올림) |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
public @interface FindStatsSummarySwaggerDocs {
}

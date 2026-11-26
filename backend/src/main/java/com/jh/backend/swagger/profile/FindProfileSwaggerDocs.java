package com.jh.backend.swagger.profile;

import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.common.annotation.JwtNotRequired;
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
@JwtNotRequired
@Operation(
        summary = "프로필 조회",
        description = """
                관리자 프로필과 핵심 기술 스택을 조회합니다.

                메인 히어로, CORE STACK, CONTACT 영역과 관리자 프로필 화면에서 함께 사용합니다.
                결과는 캐시되며, 프로필 또는 기술 스택이 수정되면 갱신됩니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `adminName` | `String` | 관리자 이름 |
                | `adminDescription` | `String` | 관리자 소개 |
                | `adminGithubUrl` | `String` | GitHub 주소 (없으면 null) |
                | `adminEmail` | `String` | 이메일 (없으면 null) |
                | `adminProfileUrl` | `String` | 프로필 이미지 URL (없으면 null) |
                | `skills[].skillId` | `Long` | 기술 스택 PK |
                | `skills[].skillName` | `String` | 기술 스택 이름 |
                | `skills[].skillCategory` | `String` | 기술 스택 카테고리 |
                | `skills[].skillUrl` | `String` | 기술 스택 아이콘 URL |
                | `skills[].adminSkillPriority` | `Integer` | 핵심 기술 스택 순서 (오름차순 정렬) |
                """
)
@ApiExceptionDocs({
        ExceptionCode.ADMIN_NOT_FOUND
})
public @interface FindProfileSwaggerDocs {
}

package com.jh.backend.swagger.skill;

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
        summary = "기술 스택 카테고리 목록 조회",
        description = """
                관리자가 등록된 기술 스택의 카테고리 목록을 조회합니다.

                카테고리는 기술 스택 추가시 자유 입력이므로 등록된 값으로 목록을 만들며, 기술 스택 관리 화면의 카테고리 탭 구성에 사용합니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `skillCategories` | `List<String>` | 카테고리 목록 (중복 제거, 대소문자 무시 알파벳 오름차순) |

                등록된 기술 스택이 없으면 `skillCategories: []`를 반환합니다.
                """,
        security = @SecurityRequirement(name = "Authorization")
)
public @interface FindAllSkillCategoriesSwaggerDocs {
}

package com.jh.backend.common.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/*
해당 어노테이션을 Swagger상에 추가하면 401, 403 관련 SwaggerDocs가 작성되지 않습니다.
- 컨트롤러 메서드, 컨트롤러 클래스, Swagger Docs 어노테이션에 선언 가능
- 실제 인증 여부는 SecurityConfig에서 결정하며, 이 어노테이션은 문서에만 영향을 줍니다.
 */
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JwtNotRequired {
}

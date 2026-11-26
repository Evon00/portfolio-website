package com.jh.backend.common.annotation;

import com.jh.backend.exception.ExceptionCode;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/*
ExceptionCode를 담아 스웨거 자동 작성을 위한 커스텀 어노테이션 입니다.
 */
@Target({ElementType.METHOD, ElementType.ANNOTATION_TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ApiExceptionDocs {
    ExceptionCode[] value();
}

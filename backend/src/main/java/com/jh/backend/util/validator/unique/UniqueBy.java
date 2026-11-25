package com.jh.backend.util.validator.unique;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Repeatable(UniqueBy.List.class)
@Constraint(validatedBy = UniqueByValidator.class)
public @interface UniqueBy {

    /*
     * 리스트 아이템에서 중복 체크할 프로퍼티명
     * ex) "projectMediaId", "fileIndex"
     * 중첩 프로퍼티도 가능: "icon.id"
     */
    String property();

    /*
     * null 값은 중복 체크에서 제외할지 여부
     * 보통 true가 편함 (개별 @NotNull이 잡도록)
     */
    boolean ignoreNull() default true;

    /*
     * 문자열 비교 시 대소문자 무시 여부 (String일 때만 적용)
     */
    boolean ignoreCase() default false;

    String message() default "리스트 내 {property} 값이 중복될 수 없습니다.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    // 한 필드에 여러 프로퍼티를 검증할 때 사용
    @Target({ElementType.FIELD, ElementType.PARAMETER})
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    @interface List {
        UniqueBy[] value();
    }
}

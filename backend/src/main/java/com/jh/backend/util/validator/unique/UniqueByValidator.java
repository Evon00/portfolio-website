package com.jh.backend.util.validator.unique;

import com.jh.backend.util.validator.ValidatorSupport;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Collection;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class UniqueByValidator implements ConstraintValidator<UniqueBy, Collection<?>> {

    private String property;
    private boolean ignoreNull;
    private boolean ignoreCase;

    @Override
    public void initialize(UniqueBy constraintAnnotation) {
        this.property = constraintAnnotation.property();
        this.ignoreNull = constraintAnnotation.ignoreNull();
        this.ignoreCase = constraintAnnotation.ignoreCase();
    }

    /*
     * Collection 내부 객체에서 지정된 property 값을 추출하여
     * 중복 값이 존재하는지 검사한다.
     */
    @Override
    public boolean isValid(Collection<?> objects, ConstraintValidatorContext context) {
        if (objects == null) return true;

        Set<Object> seen = new HashSet<>();
        for (Object item : objects) {
            if (item == null) continue;

            Object value = ValidatorSupport.readProperty(item, property);
            if (value == null && ignoreNull) continue;

            if (ignoreCase && value instanceof String text) {
                value = text.toLowerCase(Locale.ROOT);
            }

            //  HashSet.add() 가 false면 이미 존재하는 값 (중복)
            if (!seen.add(value)) return false;
        }
        return true;
    }
}

package com.jh.backend.util.validator.enums;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/*
ENUM Validator
- Request시에 String 으로 받아온 ENUM value에 대해서 검증 후 Validation Error 처리
- ENUM 이름과 정확히 일치해야 통과 (대소문자 구분)
 */
public class EnumValidator implements ConstraintValidator<ValidEnum, String> {

    private Set<String> names;
    private boolean nullable;

    @Override
    public void initialize(ValidEnum constraintAnnotation) {
        this.names = Arrays.stream(constraintAnnotation.enumClass().getEnumConstants())
                .map(Enum::name)
                .collect(Collectors.toUnmodifiableSet());
        this.nullable = constraintAnnotation.nullable();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return nullable;
        }
        return names.contains(value);
    }
}

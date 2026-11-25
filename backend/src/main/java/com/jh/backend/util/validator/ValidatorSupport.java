package com.jh.backend.util.validator;

import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

public final class ValidatorSupport {

    private ValidatorSupport() {
    }

    /*
     * 객체에서 property 값을 읽어오는 메소드
     *
     * 중첩 property ("a.b.c") 지원
     */
    public static Object readProperty(Object target, String path) {
        Object current = target;
        for (String property : path.split("\\.")) {
            if (current == null) return null;
            current = readSingle(current, property);
        }
        return current;
    }

    /*
     * 단일 property 값을 읽는 메소드
     *
     * getter → record 접근자 → field 순서로 접근
     * 모두 없으면 개발 중에 발견할 수 있도록 예외 발생
     */
    private static Object readSingle(Object target, String property) {
        Class<?> clazz = target.getClass();
        String suffix = Character.toUpperCase(property.charAt(0)) + property.substring(1);

        for (String name : new String[]{"get" + suffix, "is" + suffix, property}) {
            Method method = findMethod(clazz, name);
            if (method != null) {
                return read(() -> {
                    method.setAccessible(true);
                    return method.invoke(target);
                });
            }
        }

        Field field = findField(clazz, property);
        if (field == null) {
            throw new CustomException(ExceptionCode.REFLECTION_ACCESS_ERROR);
        }
        return read(() -> {
            field.setAccessible(true);
            return field.get(target);
        });
    }

    private static Method findMethod(Class<?> clazz, String name) {
        try {
            return clazz.getMethod(name);
        } catch (NoSuchMethodException e) {
            return null;
        }
    }

    /*
     * 클래스 및 부모 클래스까지 확인하며
     * 지정된 이름의 Field 찾기
     */
    private static Field findField(Class<?> clazz, String name) {
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            try {
                return current.getDeclaredField(name);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        return null;
    }

    private static Object read(Reader reader) {
        try {
            return reader.read();
        } catch (ReflectiveOperationException | RuntimeException e) {
            throw new CustomException(ExceptionCode.REFLECTION_ACCESS_ERROR);
        }
    }

    @FunctionalInterface
    private interface Reader {
        Object read() throws ReflectiveOperationException;
    }
}

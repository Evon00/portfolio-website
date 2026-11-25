package com.jh.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException extends RuntimeException {

    private final ExceptionCode exceptionCode;

    // 에러 응답의 data에 담을 값 (없으면 null)
    private final transient Object data;

    public CustomException(ExceptionCode exceptionCode) {
        this(exceptionCode, null);
    }

    // 데이터 포함 에러
    public CustomException(ExceptionCode exceptionCode, Object data) {
        super(exceptionCode.getMessage());
        this.exceptionCode = exceptionCode;
        this.data = data;
    }

    public HttpStatus getHttpStatus() {
        return exceptionCode.getStatus();
    }

    public String getErrorCode() {
        return exceptionCode.getCode();
    }
}

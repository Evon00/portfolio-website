package com.jh.backend.exception;

public class AuthException extends CustomException {

    public AuthException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }
}

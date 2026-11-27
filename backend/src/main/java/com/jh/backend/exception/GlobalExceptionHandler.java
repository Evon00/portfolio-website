package com.jh.backend.exception;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.annotation.AuthExceptionSwaggerDocs;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.InvalidParameterException;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.concurrent.TimeoutException;

/*
전역 예외 처리
- 4xx : warn 로그
- 5xx : error 로그 + 스택트레이스
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    //  502  //
    //  외부 서비스 연결 실패시 오류  //
    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleResourceAccessException(ResourceAccessException ex, HttpServletRequest request) {
        return handle(ExceptionCode.API_BAD_GATEWAY, ex, request);
    }

    //  500  //
    //  서버 자체 오류  //
    @ExceptionHandler(Exception.class)
    public ResponseEntity<CommonApiResponse<Object>> handleException(Exception ex, HttpServletRequest request) {
        return handle(ExceptionCode.INTERNAL_SERVER_ERROR, ex, request);
    }

    //  415  //
    //  지원하지 않는 미디어 타입 호출시 오류  //
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        return handle(ExceptionCode.UNSUPPORTED_MEDIA_TYPE, ex, request);
    }

    //  409  //
    //  데이터 무결성 위반시 오류  //
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleDataIntegrityViolationException(DataIntegrityViolationException ex, HttpServletRequest request) {
        return handle(ExceptionCode.DATA_INTEGRITY_VIOLATION, ex, request);
    }

    //  408  //
    //  비동기, 요청 타임아웃시 오류  //
    @ExceptionHandler({AsyncRequestTimeoutException.class, TimeoutException.class})
    public ResponseEntity<CommonApiResponse<Object>> handleTimeoutException(Exception ex, HttpServletRequest request) {
        return handle(ExceptionCode.REQUEST_TIMEOUT, ex, request);
    }

    //  406  //
    //  Accept 헤더 불일치시 오류  //
    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleHttpMediaTypeNotAcceptableException(HttpMediaTypeNotAcceptableException ex, HttpServletRequest request) {
        return handle(ExceptionCode.NOT_ACCEPTABLE, ex, request);
    }

    //  405  //
    //  잘못된 HTTP 메서드 호출시 오류  //
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        return handle(ExceptionCode.METHOD_NOT_ALLOWED, ex, request);
    }

    //  404  //
    //  없는 리소스 호출시 오류  //
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleNoResourceFoundException(NoResourceFoundException ex, HttpServletRequest request) {
        return handle(ExceptionCode.RESOURCE_NOT_FOUND, ex, request);
    }

    //  404  //
    //  없는 컨트롤러 호출시 오류  //
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleNoHandlerFoundException(NoHandlerFoundException ex, HttpServletRequest request) {
        return handle(ExceptionCode.HANDLER_NOT_FOUND, ex, request);
    }

    //  400  //
    //  @RequestBody, @ModelAttribute Valid 관련 오류  //
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ObjectError error = ex.getBindingResult().getAllErrors().getFirst();

        //  타입 변환 실패의 기본 메시지에는 내부 정보가 포함되어 있어 전달하지 않음  //
        if (error instanceof FieldError fieldError && fieldError.isBindingFailure()) {
            return handle(ExceptionCode.INVALID_REQUEST_PARAM, ex, request);
        }
        return handle(ExceptionCode.VALID_ERROR, error.getDefaultMessage(), ex, request);
    }

    //  400  //
    //  Parameter Valid 관련 오류  //
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleHandlerMethodValidationException(HandlerMethodValidationException ex, HttpServletRequest request) {
        String message = ex.getAllErrors().stream()
                .findFirst()
                .map(MessageSourceResolvable::getDefaultMessage)
                .orElse(ExceptionCode.VALID_ERROR.getMessage());
        return handle(ExceptionCode.VALID_ERROR, message, ex, request);
    }

    //  400  //
    //  이상한 형태의 데이터 입력시 오류 (JSON 파싱 실패 포함)  //
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return handle(ExceptionCode.NOT_READABLE_JSON, ex, request);
    }

    //  400  //
    //  경로 변수 누락시 오류  //
    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleMissingPathVariableException(MissingPathVariableException ex, HttpServletRequest request) {
        return handle(ExceptionCode.MISSING_PATH_VARIABLE, ex, request);
    }

    //  400  //
    //  파라미터, 쿠키, 헤더, @RequestPart 누락 및 타입 불일치, 파라미터 디코딩(잘못된 인코딩) 오류  //
    @ExceptionHandler({
            ServletRequestBindingException.class,
            MissingServletRequestPartException.class,
            MethodArgumentTypeMismatchException.class,
            InvalidParameterException.class
    })
    public ResponseEntity<CommonApiResponse<Object>> handleInvalidRequestParam(Exception ex, HttpServletRequest request) {
        return handle(ExceptionCode.INVALID_REQUEST_PARAM, ex, request);
    }

    //  400  //
    //  파일 용량 초과시 오류  //
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return handle(ExceptionCode.FILE_SIZE_EXCEED, ex, request);
    }

    //  400  //
    //  multipart/form-data 요청 파싱 실패시 오류  //
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleMultipartException(MultipartException ex, HttpServletRequest request) {
        return handle(ExceptionCode.FILE_UPLOAD_FAIL, ex, request);
    }

    //  403, 401  //
    //  권한 관련 오류  //
    @AuthExceptionSwaggerDocs
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleAuthException(AuthException ex, HttpServletRequest request) {
        return handleCustomException(ex, request);
    }

    //  커스텀 오류  //
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<CommonApiResponse<Object>> handleCustomException(CustomException ex, HttpServletRequest request) {
        writeLog(ex.getExceptionCode(), ex, request);
        return toResponse(ex.getExceptionCode(), CommonApiResponse.error(ex));
    }

    private ResponseEntity<CommonApiResponse<Object>> handle(ExceptionCode code, Exception ex, HttpServletRequest request) {
        return handle(code, code.getMessage(), ex, request);
    }

    private ResponseEntity<CommonApiResponse<Object>> handle(ExceptionCode code, String message, Exception ex, HttpServletRequest request) {
        writeLog(code, ex, request);
        return toResponse(code, CommonApiResponse.error(code, message));
    }

    //  Accept 헤더와 관계없이 항상 JSON으로 응답  //
    private ResponseEntity<CommonApiResponse<Object>> toResponse(ExceptionCode code, CommonApiResponse<Object> body) {
        return ResponseEntity.status(code.getStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body);
    }

    private void writeLog(ExceptionCode code, Exception ex, HttpServletRequest request) {
        if (code.getStatus().is5xxServerError()) {
            log.error("{} : {} / method : {}, uri : {}", ex.getClass().getSimpleName(), ex.getMessage(), request.getMethod(), request.getRequestURI(), ex);
        } else {
            log.warn("{} : {} / method : {}, uri : {}", ex.getClass().getSimpleName(), logMessage(ex), request.getMethod(), request.getRequestURI());
        }
    }

    //  Validation 예외 메시지에는 입력값(비밀번호 등)이 포함되므로 필드명과 사유만 기록  //
    private String logMessage(Exception ex) {
        if (ex instanceof MethodArgumentNotValidException validException) {
            return validException.getBindingResult().getFieldErrors().stream()
                    .map(error -> error.getField() + "(" + error.getCode() + ")")
                    .toList()
                    .toString();
        }
        return ex.getMessage();
    }
}

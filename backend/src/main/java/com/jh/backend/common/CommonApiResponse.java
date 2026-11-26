package com.jh.backend.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"isSuccess", "code", "message", "data"})
public class CommonApiResponse<T> {

    @Schema(description = "성공 여부", example = "true")
    @JsonProperty("isSuccess")
    private final boolean success;

    // 성공 응답에는 포함되지 않으므로 문서에서 제외 (에러 예시는 @ApiExceptionDocs로 작성)
    @Schema(hidden = true)
    @JsonProperty("code")
    private final String code;

    @Schema(description = "응답 메시지", example = "success")
    @JsonProperty("message")
    private final String message;

    @Schema(description = "응답 데이터")
    @JsonProperty("data")
    private final T data;

    private CommonApiResponse(boolean success, String code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // 데이터 포함 200
    public static <T> CommonApiResponse<T> ok(T data) {
        return new CommonApiResponse<>(true, null, "success", data);
    }

    // 데이터 포함하지 않는 200
    public static <T> CommonApiResponse<T> ok() {
        return new CommonApiResponse<>(true, null, "success", null);
    }

    // 데이터 포함하지 않는 에러
    public static CommonApiResponse<Object> error(ExceptionCode code) {
        return new CommonApiResponse<>(false, code.getCode(), code.getMessage(), null);
    }

    // 메시지를 직접 지정하는 에러 (Validation)
    public static CommonApiResponse<Object> error(ExceptionCode code, String message) {
        return new CommonApiResponse<>(false, code.getCode(), message, null);
    }

    // 커스텀 에러 (data가 있으면 함께 전달)
    public static CommonApiResponse<Object> error(CustomException exception) {
        return new CommonApiResponse<>(false, exception.getErrorCode(), exception.getMessage(), exception.getData());
    }
}

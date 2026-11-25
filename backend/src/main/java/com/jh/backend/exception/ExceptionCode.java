package com.jh.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ExceptionCode {

    //  common  //

    //502
    API_BAD_GATEWAY("COMMON_502", HttpStatus.BAD_GATEWAY, "외부 서비스 연결에 실패했습니다."),

    //500
    INTERNAL_SERVER_ERROR("COMMON_500", HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."),
    REFLECTION_ACCESS_ERROR("COMMON_500", HttpStatus.INTERNAL_SERVER_ERROR, "객체 프로퍼티 접근 중 오류가 발생했습니다."),

    //429
    TOO_MANY_REQUESTS("COMMON_429", HttpStatus.TOO_MANY_REQUESTS, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."),

    //415
    UNSUPPORTED_MEDIA_TYPE("COMMON_415", HttpStatus.UNSUPPORTED_MEDIA_TYPE, "지원하지 않는 미디어 유형입니다."),

    //409
    DATA_INTEGRITY_VIOLATION("COMMON_409", HttpStatus.CONFLICT, "데이터 처리 중 충돌이 발생했습니다. 입력하신 정보를 확인해주세요."),

    //408
    REQUEST_TIMEOUT("COMMON_408", HttpStatus.REQUEST_TIMEOUT, "요청 처리 시간이 초과되었습니다. 다시 시도해주세요."),

    //406
    NOT_ACCEPTABLE("COMMON_406", HttpStatus.NOT_ACCEPTABLE, "지원하지 않는 응답 형식을 요청하셨습니다. 요청 형식을 확인해주세요."),

    //405
    METHOD_NOT_ALLOWED("COMMON_405", HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 요청 방식입니다."),

    //404
    RESOURCE_NOT_FOUND("COMMON_404", HttpStatus.NOT_FOUND, "요청하신 리소스를 찾을 수 없습니다."),
    HANDLER_NOT_FOUND("COMMON_404", HttpStatus.NOT_FOUND, "요청하신 경로를 찾을 수 없습니다."),

    //403
    JWT_ROLE_DENIED("COMMON_403", HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    //401
    JWT_INVALID("COMMON_401", HttpStatus.UNAUTHORIZED, "로그인이 필요하거나 인증 정보가 올바르지 않습니다. 다시 로그인해주세요."),
    JWT_EXPIRED("COMMON_401", HttpStatus.UNAUTHORIZED, "로그인 시간이 만료되었습니다. 다시 로그인해주세요."),
    REFRESH_JWT_EXPIRED("COMMON_401", HttpStatus.UNAUTHORIZED, "로그인 상태가 만료되었습니다. 다시 로그인해주세요."),
    REFRESH_JWT_INVALID("COMMON_401", HttpStatus.UNAUTHORIZED, "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요."),

    //400
    NOT_READABLE_JSON("COMMON_400", HttpStatus.BAD_REQUEST, "올바른 형식의 데이터가 아닙니다."),
    VALID_ERROR("COMMON_400", HttpStatus.BAD_REQUEST, "데이터 검증 오류가 발생하였습니다."),
    INVALID_REQUEST_PARAM("COMMON_400", HttpStatus.BAD_REQUEST, "요청 파라미터가 올바르지 않습니다."),
    MISSING_PATH_VARIABLE("COMMON_400", HttpStatus.BAD_REQUEST, "필수 경로 변수가 누락되었습니다."),
    FILE_SIZE_EXCEED("COMMON_400", HttpStatus.BAD_REQUEST, "파일 크기가 허용 용량을 초과했습니다."),
    FILE_TYPE_INVALID("COMMON_400", HttpStatus.BAD_REQUEST, "업로드할 수 없는 파일 형식입니다."),
    FILE_UPLOAD_FAIL("COMMON_400", HttpStatus.BAD_REQUEST, "파일 업로드에 실패했습니다. 다시 시도해주세요."),
    DATE_RANGE_INVALID("COMMON_400", HttpStatus.BAD_REQUEST, "날짜 범위가 올바르지 않습니다."),

    //  common  //

    //  service  //

    //ADMIN
    ADMIN_LOGIN_FAILED("ADMIN_001", HttpStatus.BAD_REQUEST, "아이디 또는 비밀번호가 일치하지 않습니다."),

    //POST
    POST_NOT_FOUND("POST_001", HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    POST_SLUG_DUPLICATED("POST_002", HttpStatus.CONFLICT, "이미 사용 중인 게시글 슬러그입니다."),

    //PROJECT
    PROJECT_NOT_FOUND("PROJECT_001", HttpStatus.NOT_FOUND, "프로젝트를 찾을 수 없습니다."),
    PROJECT_SLUG_DUPLICATED("PROJECT_002", HttpStatus.CONFLICT, "이미 사용 중인 프로젝트 슬러그입니다."),

    //SKILL
    SKILL_IN_USE("SKILL_001", HttpStatus.CONFLICT, "사용 중인 기술 스택은 삭제할 수 없습니다."),
    SKILL_NOT_FOUND("SKILL_002", HttpStatus.NOT_FOUND, "기술 스택을 찾을 수 없습니다."),
    SKILL_NAME_DUPLICATED("SKILL_003", HttpStatus.CONFLICT, "이미 등록된 기술 스택 이름입니다."),

    //  service  //
    ;

    private final String code;
    private final HttpStatus status;
    private final String message;
}

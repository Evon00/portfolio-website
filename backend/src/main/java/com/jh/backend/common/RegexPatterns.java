package com.jh.backend.common;

// 공통 정규식
public final class RegexPatterns {

    // 슬러그 (영문 소문자, 숫자, 하이픈 / 하이픈으로 시작·끝나거나 연속 불가)
    public static final String SLUG = "^[a-z0-9]+(-[a-z0-9]+)*$";

    // http, https 주소 (공백 불가)
    public static final String HTTP_URL = "^https?://\\S+$";

    private RegexPatterns() {
    }
}

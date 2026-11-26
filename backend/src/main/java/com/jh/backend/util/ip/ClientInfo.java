package com.jh.backend.util.ip;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;

/*
클라이언트 접속 정보 (게시글 조회 로그용)
- ip : 클라이언트 IP
- userAgent : 브라우저 정보 (없으면 unknown)
 */
public record ClientInfo(String ip, String userAgent) {

    private static final String UNKNOWN_USER_AGENT = "unknown";

    public static ClientInfo from(HttpServletRequest request) {
        return new ClientInfo(IpUtils.getClientIp(request), resolveUserAgent(request));
    }

    private static String resolveUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader(HttpHeaders.USER_AGENT);
        return StringUtils.hasText(userAgent) ? userAgent : UNKNOWN_USER_AGENT;
    }
}

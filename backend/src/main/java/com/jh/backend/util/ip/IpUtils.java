package com.jh.backend.util.ip;

import jakarta.servlet.http.HttpServletRequest;

/*
클라이언트 IP 추출
- server.forward-headers-strategy=native 전제
    Tomcat(RemoteIpValve)이 신뢰 프록시(127.x, 10.x, 172.16~31.x, 192.168.x 등)에서 온 요청에 한해
    X-Forwarded-For 를 해석하여 getRemoteAddr() 를 실제 클라이언트 IP로 바꿔준다.
- DB의 INET 컬럼에 저장하므로 "unknown" 같은 문자열 대신 0.0.0.0 을 반환한다.
 */
public final class IpUtils {

    private static final String UNKNOWN_IP = "0.0.0.0";

    private IpUtils() {
    }

    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getRemoteAddr();

        if (ip == null || ip.isBlank()) {
            return UNKNOWN_IP;
        }

        // IPv6 zone id 제거 (fe80::1%eth0 → fe80::1)
        int zoneIndex = ip.indexOf('%');
        if (zoneIndex != -1) {
            ip = ip.substring(0, zoneIndex);
        }

        // IPv6 루프백 → IPv4 (로컬, 스웨거 호출)
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }

        // IPv4-mapped IPv6 → IPv4
        if (ip.startsWith("::ffff:")) {
            return ip.substring(7);
        }

        return ip;
    }
}

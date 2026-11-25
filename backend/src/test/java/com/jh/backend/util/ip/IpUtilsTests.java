package com.jh.backend.util.ip;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class IpUtilsTests {

    @ParameterizedTest
    @DisplayName("INET 컬럼에 저장할 수 있는 IP를 반환한다")
    @CsvSource(value = {
            "203.0.113.7, 203.0.113.7",
            "0:0:0:0:0:0:0:1, 127.0.0.1",
            "::1, 127.0.0.1",
            "::ffff:203.0.113.7, 203.0.113.7",
            "2001:db8::1, 2001:db8::1",
            "fe80::1%eth0, fe80::1",
            "'', 0.0.0.0",
            "NULL, 0.0.0.0"
    }, nullValues = "NULL")
    void getClientIp(String remoteAddr, String expected) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr(remoteAddr);

        assertThat(IpUtils.getClientIp(request)).isEqualTo(expected);
    }
}

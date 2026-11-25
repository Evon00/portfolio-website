package com.jh.backend.util.ip;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class ClientInfoTests {

    private final MockHttpServletRequest request = new MockHttpServletRequest();

    @Test
    @DisplayName("IP와 브라우저 정보를 수집한다")
    void from() {
        request.setRemoteAddr("203.0.113.7");
        request.addHeader("User-Agent", "Mozilla/5.0");

        assertThat(ClientInfo.from(request)).isEqualTo(new ClientInfo("203.0.113.7", "Mozilla/5.0"));
    }

    @Test
    @DisplayName("헤더가 없으면 브라우저 정보는 unknown")
    void withoutUserAgent() {
        request.setRemoteAddr("203.0.113.7");

        assertThat(ClientInfo.from(request)).isEqualTo(new ClientInfo("203.0.113.7", "unknown"));
    }
}

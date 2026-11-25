package com.jh.backend.util.ip;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MDCFilterTests {

    private final MDCFilter filter = new MDCFilter();

    @Test
    @DisplayName("요청 처리 중에만 clientIp를 MDC에 담는다")
    void putAndRemove() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.7");

        filter.doFilter(request, new MockHttpServletResponse(),
                (req, res) -> assertThat(MDC.get("clientIp")).isEqualTo("203.0.113.7"));

        assertThat(MDC.get("clientIp")).isNull();
    }

    @Test
    @DisplayName("예외가 발생해도 clientIp를 제거한다")
    void removeOnException() {
        assertThatThrownBy(() -> filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(),
                (req, res) -> {
                    throw new IllegalStateException();
                })).isInstanceOf(IllegalStateException.class);

        assertThat(MDC.get("clientIp")).isNull();
    }
}

package com.jh.backend.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PageResponseDtoTests {

    @Test
    @DisplayName("페이지 응답은 명세의 필드명과 순서로 내려간다")
    void pageJson() {
        var page = new PageImpl<>(List.of(1, 2), PageRequest.of(0, 2), 5);
        var dto = new PageResponseDto<>(page, List.of("a", "b"));

        assertThat(JsonMapper.builder().build().writeValueAsString(CommonApiResponse.ok(dto))).isEqualTo(
                "{\"isSuccess\":true,\"message\":\"success\",\"data\":{\"pageNumber\":0,\"pageSize\":2,"
                        + "\"isFirst\":true,\"isLast\":false,\"totalPages\":3,\"totalElements\":5,\"content\":[\"a\",\"b\"]}}");
    }
}

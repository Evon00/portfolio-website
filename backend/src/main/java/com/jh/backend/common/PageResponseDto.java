package com.jh.backend.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@JsonPropertyOrder({
        "pageNumber",
        "pageSize",
        "isFirst",
        "isLast",
        "totalPages",
        "totalElements",
        "content"
})
public class PageResponseDto<T> {

    // 현재 페이지 번호 (0부터 시작)
    private final int pageNumber;

    // 현재 페이지 크기
    private final int pageSize;

    // 현재 페이지가 첫번째인지 여부
    @JsonProperty("isFirst")
    private final boolean first;

    // 현재 페이지가 마지막인지 여부
    @JsonProperty("isLast")
    private final boolean last;

    // 총 페이지 수
    private final int totalPages;

    // 총 데이터 수
    private final long totalElements;

    // List 형태의 데이터
    private final List<T> content;

    public PageResponseDto(Page<?> page, List<T> content) {
        this.pageNumber = page.getNumber();
        this.pageSize = page.getSize();
        this.first = page.isFirst();
        this.last = page.isLast();
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.content = content;
    }
}

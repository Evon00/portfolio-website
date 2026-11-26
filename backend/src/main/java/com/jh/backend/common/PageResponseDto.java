package com.jh.backend.common;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.media.Schema;
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

    @Schema(description = "현재 페이지 번호 (0부터 시작)", example = "0")
    private final int pageNumber;

    @Schema(description = "현재 페이지 크기", example = "10")
    private final int pageSize;

    @Schema(description = "현재 페이지가 첫번째인지 여부", example = "true")
    @JsonProperty("isFirst")
    private final boolean first;

    @Schema(description = "현재 페이지가 마지막인지 여부", example = "true")
    @JsonProperty("isLast")
    private final boolean last;

    @Schema(description = "총 페이지 수", example = "1")
    private final int totalPages;

    @Schema(description = "총 데이터 수", example = "1")
    private final long totalElements;

    @Schema(description = "List 형태의 데이터")
    private final List<T> content;

    private PageResponseDto(Page<?> page, List<T> content) {
        this.pageNumber = page.getNumber();
        this.pageSize = page.getSize();
        this.first = page.isFirst();
        this.last = page.isLast();
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.content = content;
    }

    public static <T> PageResponseDto<T> of(Page<?> page, List<T> content) {
        return new PageResponseDto<>(page, content);
    }
}

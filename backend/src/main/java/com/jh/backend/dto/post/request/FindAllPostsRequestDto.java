package com.jh.backend.dto.post.request;

import com.jh.backend.common.enums.PostKeywordType;
import com.jh.backend.common.enums.PostSortBy;
import com.jh.backend.common.enums.SortDirection;
import com.jh.backend.util.validator.enums.ValidEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record FindAllPostsRequestDto(

        @Min(value = 0, message = "페이지 번호는 0 이상이어야 합니다.")
        @Schema(description = "페이지 번호 (0부터, 기본 0)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "0")
        Integer pageNumber,

        @Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다.")
        @Max(value = 50, message = "페이지 크기는 최대 50까지 가능합니다.")
        @Schema(description = "페이지 크기 (1~50, 기본 10)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "10")
        Integer pageSize,

        @ValidEnum(enumClass = PostSortBy.class, nullable = true, message = "정렬 기준은 createdAt, postView 중 하나여야 합니다.")
        @Schema(description = "정렬 기준 (createdAt : 등록일, postView : 조회수, 기본 createdAt)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, allowableValues = {"createdAt", "postView"}, example = "createdAt")
        String sortBy,

        @ValidEnum(enumClass = SortDirection.class, nullable = true, message = "정렬 방향은 asc, desc 중 하나여야 합니다.")
        @Schema(description = "정렬 방향 (기본 desc)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, allowableValues = {"asc", "desc"}, example = "desc")
        String sortDir,

        @ValidEnum(enumClass = PostKeywordType.class, nullable = true, message = "검색 종류는 TITLE, CONTENT, TITLE_CONTENT, SKILL 중 하나여야 합니다.")
        @Schema(description = "검색 종류 (제목, 내용, 제목+내용, 기술 스택명 / 검색어만 있으면 TITLE_CONTENT)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, allowableValues = {"TITLE", "CONTENT", "TITLE_CONTENT", "SKILL"}, example = "TITLE")
        String keywordType,

        @Size(max = 100, message = "검색어는 최대 100자까지 입력 가능합니다.")
        @Schema(description = "검색어 (부분 일치, 대소문자 무시)", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "Redis")
        String keyword
) {
}

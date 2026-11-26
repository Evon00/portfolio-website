package com.jh.backend.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 게시글 정렬 기준 (요청 값 = 상수 이름, 정렬할 엔티티 필드명)
@Getter
@AllArgsConstructor
public enum PostSortBy {
    createdAt("createdAt"),
    postView("view");

    private final String property;
}

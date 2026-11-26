package com.jh.backend.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Sort;

// 정렬 방향 (요청 값 = 상수 이름)
@Getter
@AllArgsConstructor
public enum SortDirection {
    asc(Sort.Direction.ASC),
    desc(Sort.Direction.DESC);

    private final Sort.Direction direction;
}

package com.jh.backend.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 이미지 확장자 (SVG는 기술스택만 허용, jpeg는 JPG로 저장)
@Getter
@AllArgsConstructor
public enum MediaExt {
    JPG("image/jpeg"),
    PNG("image/png"),
    GIF("image/gif"),
    WEBP("image/webp"),
    SVG("image/svg+xml");

    private final String contentType;
}

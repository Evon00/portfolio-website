package com.jh.backend.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

// 저장 폴더 및 허용 확장자
@Getter
@AllArgsConstructor
public enum StorageFolder {
    PROFILE("profile", Set.of(MediaExt.JPG, MediaExt.PNG, MediaExt.GIF, MediaExt.WEBP)),
    SKILL("skill", Set.of(MediaExt.JPG, MediaExt.PNG, MediaExt.GIF, MediaExt.WEBP, MediaExt.SVG)),
    POST("post", Set.of(MediaExt.JPG, MediaExt.PNG, MediaExt.GIF, MediaExt.WEBP)),
    PROJECT("project", Set.of(MediaExt.JPG, MediaExt.PNG, MediaExt.GIF, MediaExt.WEBP));

    private final String path;
    private final Set<MediaExt> allowedExts;
}

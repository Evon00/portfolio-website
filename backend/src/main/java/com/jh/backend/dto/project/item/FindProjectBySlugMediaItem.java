package com.jh.backend.dto.project.item;

import com.jh.backend.entity.ProjectMedia;
import io.swagger.v3.oas.annotations.media.Schema;

// 프로젝트 갤러리 이미지 (공개 상세, 원본 파일명·크기 제외)
public record FindProjectBySlugMediaItem(

        @Schema(description = "프로젝트 이미지 PK", example = "21")
        Long projectMediaId,

        @Schema(description = "프로젝트 이미지 URL", example = "https://cdn.example.com/prod/project/9f1c2d3e-4b5a-6c7d-8e9f-0a1b2c3d4e5f.png")
        String projectMediaUrl,

        @Schema(description = "이미지 설명 (altText, 없으면 null)", nullable = true, example = "메인 화면")
        String projectMediaCaption,

        @Schema(description = "대표 이미지 여부", example = "true")
        boolean projectMediaIsImportant,

        @Schema(description = "이미지 순서 (오름차순 정렬)", example = "1")
        Integer projectMediaPriority
) {

    public static FindProjectBySlugMediaItem fromEntity(ProjectMedia media, String url) {
        return new FindProjectBySlugMediaItem(
                media.getId(),
                url,
                media.getCaption(),
                media.isImportant(),
                media.getPriority());
    }
}

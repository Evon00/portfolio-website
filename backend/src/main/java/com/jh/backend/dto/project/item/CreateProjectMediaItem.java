package com.jh.backend.dto.project.item;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// 프로젝트 추가시 갤러리 이미지 정보 (files 파트와 fileIndex로 연결)
public record CreateProjectMediaItem(

        @NotNull(message = "파일 인덱스는 필수값입니다.")
        @PositiveOrZero(message = "파일 인덱스는 0 이상이어야 합니다.")
        @Schema(description = "files 파트의 인덱스 (0부터)", requiredMode = Schema.RequiredMode.REQUIRED, example = "0")
        Integer fileIndex,

        @Size(max = 50, message = "이미지 설명은 최대 50자까지 입력 가능합니다.")
        @Schema(description = "이미지 설명 (최대 50자, 빈 값이면 null)", example = "메인 화면")
        String projectMediaCaption,

        @Schema(description = "대표 이미지 여부 (최대 1개, 기본 false)", example = "true")
        Boolean projectMediaIsImportant
) {

    // 캡션 앞뒤 공백 제거 후 비어 있으면 null
    public CreateProjectMediaItem {
        projectMediaCaption = projectMediaCaption != null && !projectMediaCaption.isBlank() ? projectMediaCaption.strip() : null;
    }
}

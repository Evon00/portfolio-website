package com.jh.backend.dto.project.item;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// 프로젝트 수정시 최종 갤러리 이미지 정보 (기존 이미지는 projectMediaId, 새 이미지는 fileIndex 중 하나만)
public record UpdateProjectMediaItem(

        @Positive(message = "프로젝트 이미지 PK는 0보다 큰 양수여야 합니다.")
        @Schema(description = "기존 이미지 PK (새 이미지면 null)", example = "21")
        Long projectMediaId,

        @PositiveOrZero(message = "파일 인덱스는 0 이상이어야 합니다.")
        @Schema(description = "새 이미지의 files 파트 인덱스 (0부터, 기존 이미지면 null)", example = "0")
        Integer fileIndex,

        @Size(max = 50, message = "이미지 설명은 최대 50자까지 입력 가능합니다.")
        @Schema(description = "이미지 설명 (최대 50자, null 또는 빈 값이면 설명 없음)", example = "메인 화면")
        String projectMediaCaption,

        @Schema(description = "대표 이미지 여부 (최대 1개, null이면 false)", example = "true")
        Boolean projectMediaIsImportant
) {

    // 캡션 앞뒤 공백 제거 후 비어 있으면 null
    public UpdateProjectMediaItem {
        projectMediaCaption = projectMediaCaption != null && !projectMediaCaption.isBlank() ? projectMediaCaption.strip() : null;
    }
}

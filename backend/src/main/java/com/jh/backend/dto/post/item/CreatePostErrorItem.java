package com.jh.backend.dto.post.item;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

// 게시글 추가 실패(POST_004)시 사용할 수 없는 게시글 이미지 PK 목록
public record CreatePostErrorItem(

        @ArraySchema(schema = @Schema(description = "존재하지 않거나 삭제됐거나 이미 다른 게시글에 연결된 게시글 이미지 PK", example = "10"))
        List<Long> postMediaIds
) {
}

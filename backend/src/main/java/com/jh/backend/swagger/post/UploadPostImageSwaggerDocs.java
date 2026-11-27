package com.jh.backend.swagger.post;

import com.jh.backend.common.annotation.ApiExceptionDocs;
import com.jh.backend.exception.ExceptionCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Operation(
        summary = "게시글 이미지 업로드",
        description = """
                관리자가 게시글 본문에 넣을 이미지를 업로드합니다.

                에디터의 이미지 버튼 또는 드래그 앤 드롭시 호출하며, 응답의 `postMediaUrl`을 본문 마크다운에 삽입합니다.

                ---

                ## Request
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `file` | `MultipartFile` | ✅ | 이미지 파일 (JPG, PNG, GIF, WEBP / 10MB 이하, 요청 1번에 파일 1개) |

                - 업로드한 이미지는 게시글에 연결되지 않은 상태로 저장됩니다.
                - 게시글 추가/수정시 `postMediaIds`로 전달하면 게시글에 연결됩니다.
                - 일정 시간 동안 연결되지 않은 이미지는 자동으로 삭제됩니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `postMediaId` | `Long` | 게시글 미디어 PK |
                | `postMediaUrl` | `String` | 게시글 이미지 URL |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.FILE_REQUIRED,
        ExceptionCode.FILE_TYPE_INVALID,
        ExceptionCode.FILE_SIZE_EXCEED,
        ExceptionCode.API_BAD_GATEWAY
})
public @interface UploadPostImageSwaggerDocs {
}

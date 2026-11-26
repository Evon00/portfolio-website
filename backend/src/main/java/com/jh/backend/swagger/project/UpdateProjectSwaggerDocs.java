package com.jh.backend.swagger.project;

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
        summary = "프로젝트 수정",
        description = """
                관리자가 프로젝트를 수정합니다. (PATCH, multipart : `data` JSON + `files` 새 갤러리 이미지)

                - 보낸 필드만 수정하며, null이거나 보내지 않은 필드는 기존 값을 유지합니다.
                - `projectEndDate`, `projectGithubUrl`, `projectUrl`은 빈 문자열(`""`)을 보내면 값을 지웁니다.
                - 슬러그는 수정할 수 없습니다.

                ---

                ## Request - data (application/json)
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `projectTitle` | `String` | ❌ | 제목 (최대 100자, 공백 불가) |
                | `projectSummary` | `String` | ❌ | 요약 (최대 200자, 공백 불가) |
                | `projectContent` | `String` | ❌ | 본문 (마크다운, 최대 100,000자, 공백 불가) |
                | `projectStartDate` | `LocalDate` | ❌ | 시작일 (YYYY-MM-DD) |
                | `projectEndDate` | `String` | ❌ | 종료일 (YYYY-MM-DD, 빈 문자열이면 지움 = 진행 중) |
                | `projectGithubUrl` | `String` | ❌ | GitHub 주소 (http(s)://, 최대 300자, 빈 문자열이면 지움) |
                | `projectGithubIsPublic` | `Boolean` | ❌ | 레포지토리 공개 여부 |
                | `projectUrl` | `String` | ❌ | 사이트 주소 (http(s)://, 최대 300자, 빈 문자열이면 지움) |
                | `skillIds` | `List<Long>` | ❌ | 기술 스택 PK 1~20개 (보내면 전체 교체) |
                | `projectMedias[].projectMediaId` | `Long` | 조건부 | 유지할 기존 이미지 PK (`fileIndex`와 둘 중 하나) |
                | `projectMedias[].fileIndex` | `Integer` | 조건부 | 새 이미지의 `files` 인덱스 (`projectMediaId`와 둘 중 하나) |
                | `projectMedias[].projectMediaCaption` | `String` | ❌ | 이미지 설명 (최대 50자, 없으면 설명 없음) |
                | `projectMedias[].projectMediaIsImportant` | `Boolean` | ❌ | 대표 이미지 여부 (최대 1개, 없으면 false) |

                ## Request - files
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `files` | `MultipartFile[]` | ❌ | 새로 추가하는 갤러리 이미지만 (JPG·PNG·GIF·WEBP, 장당 10MB 이하) |

                - `projectMedias`는 수정 후 최종 갤러리 전체입니다. (최대 10개, 배열 순서 = 이미지 노출 순서)
                - `projectMedias`를 보내지 않으면 이미지는 그대로 유지하며, 이때 `files`를 보내면 400입니다.
                - `projectMedias`에서 빠진 기존 이미지는 삭제되고, 빈 배열이면 모든 이미지를 삭제합니다.
                - 새 파일은 모두 `projectMedias`에 정확히 한 번씩 연결되어야 합니다.
                - 최종 종료일이 최종 시작일보다 이르면 400입니다.

                ---

                ## Response
                | 필드명 | 타입 | 설명 |
                |:-------|:-----|:-----|
                | `projectId` | `Long` | 프로젝트 PK |
                | `projectSlug` | `String` | 프로젝트 슬러그 |
                """,
        security = @SecurityRequirement(name = "Authorization")
)
@ApiExceptionDocs({
        ExceptionCode.VALID_ERROR,
        ExceptionCode.INVALID_REQUEST_PARAM,
        ExceptionCode.DATE_RANGE_INVALID,
        ExceptionCode.SKILL_ID_DUPLICATED,
        ExceptionCode.SKILL_ID_INVALID,
        ExceptionCode.FILE_COUNT_EXCEED,
        ExceptionCode.PROJECT_MEDIA_INVALID,
        ExceptionCode.PROJECT_MEDIA_IMPORTANT_DUPLICATED,
        ExceptionCode.FILE_REQUIRED,
        ExceptionCode.FILE_TYPE_INVALID,
        ExceptionCode.FILE_SIZE_EXCEED,
        ExceptionCode.PROJECT_NOT_FOUND,
        ExceptionCode.API_BAD_GATEWAY
})
public @interface UpdateProjectSwaggerDocs {
}

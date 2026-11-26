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
        summary = "프로젝트 추가",
        description = """
                관리자가 프로젝트를 추가합니다. (multipart : `data` JSON + `files` 갤러리 이미지)

                ---

                ## Request - data (application/json)
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `projectTitle` | `String` | ✅ | 제목 (최대 100자) |
                | `projectSlug` | `String` | ✅ | 슬러그 (최대 100자, 영문 소문자·숫자·하이픈, 등록 후 변경 불가) |
                | `projectSummary` | `String` | ✅ | 요약 (최대 200자) |
                | `projectContent` | `String` | ✅ | 본문 (마크다운, 최대 100,000자) |
                | `projectStartDate` | `LocalDate` | ✅ | 시작일 (YYYY-MM-DD) |
                | `projectEndDate` | `LocalDate` | ❌ | 종료일 (진행 중이면 null, 시작일 이후) |
                | `projectGithubUrl` | `String` | ❌ | GitHub 주소 (http(s)://, 최대 300자) |
                | `projectGithubIsPublic` | `Boolean` | ❌ | 레포지토리 공개 여부 (기본 false) |
                | `projectUrl` | `String` | ❌ | 사이트 주소 (http(s)://, 최대 300자) |
                | `skillIds` | `List<Long>` | ✅ | 기술 스택 PK 1~20개 (배열 순서 = 태그 노출 순서) |
                | `projectMedias[].fileIndex` | `Integer` | ✅ | `files` 파트의 인덱스 (0부터) |
                | `projectMedias[].projectMediaCaption` | `String` | ❌ | 이미지 설명 (최대 50자) |
                | `projectMedias[].projectMediaIsImportant` | `Boolean` | ❌ | 대표 이미지 여부 (최대 1개, 기본 false) |

                ## Request - files
                | 필드명 | 타입 | 필수여부 | 설명 |
                |:-------|:-----|:----:|:-----|
                | `files` | `MultipartFile[]` | ❌ | 갤러리 이미지 (최대 10장, JPG·PNG·GIF·WEBP, 장당 10MB 이하) |

                - 파일이 있으면 모든 파일이 `projectMedias`에 정확히 한 번씩 있어야 합니다. (`projectMedias` 배열 순서 = 이미지 노출 순서)
                - 제목, 요약, URL, 캡션의 앞뒤 공백은 제거하고, 빈 URL·캡션은 null로 저장합니다.
                - 새 프로젝트는 목록의 맨 뒤(순서 최댓값 + 1)에 추가됩니다.
                - 검증을 모두 통과한 뒤 이미지를 업로드하며, 저장에 실패하면 업로드한 이미지는 삭제합니다.

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
        ExceptionCode.PROJECT_SLUG_DUPLICATED,
        ExceptionCode.API_BAD_GATEWAY
})
public @interface CreateProjectSwaggerDocs {
}

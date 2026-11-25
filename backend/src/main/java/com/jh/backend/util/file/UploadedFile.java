package com.jh.backend.util.file;

import com.jh.backend.common.enums.MediaExt;

// 업로드 결과 (DB에 저장할 값)
public record UploadedFile(String originalName, String s3Key, String size, MediaExt ext) {
}

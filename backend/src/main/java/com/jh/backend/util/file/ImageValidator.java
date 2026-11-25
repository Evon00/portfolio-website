package com.jh.backend.util.file;

import com.jh.backend.common.enums.MediaExt;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Set;

/*
이미지 검증
- 용량, 파일명의 확장자, 실제 파일 내용을 확인합니다.
- 확장자와 실제 내용이 다르면 거부합니다.
 */
@Component
public class ImageValidator {

    private static final long MAX_SIZE = 10L * 1024 * 1024;

    private final Tika tika = new Tika();

    public MediaExt validate(MultipartFile file, Set<MediaExt> allowedExts) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ExceptionCode.FILE_REQUIRED);
        }
        if (file.getSize() > MAX_SIZE) {
            throw new CustomException(ExceptionCode.FILE_SIZE_EXCEED);
        }

        MediaExt ext = toMediaExt(StringUtils.getFilenameExtension(file.getOriginalFilename()));

        if (ext == null || !allowedExts.contains(ext) || !matchesContent(file, ext)) {
            throw new CustomException(ExceptionCode.FILE_TYPE_INVALID);
        }
        return ext;
    }

    private MediaExt toMediaExt(String extension) {
        if (extension == null) return null;
        return switch (extension.toLowerCase(Locale.ROOT)) {
            case "jpg", "jpeg" -> MediaExt.JPG;
            case "png" -> MediaExt.PNG;
            case "gif" -> MediaExt.GIF;
            case "webp" -> MediaExt.WEBP;
            case "svg" -> MediaExt.SVG;
            default -> null;
        };
    }

    private boolean matchesContent(MultipartFile file, MediaExt ext) {
        try {
            byte[] bytes = file.getBytes();
            return ext == MediaExt.SVG
                    ? SvgValidator.isSafe(bytes)
                    : ext.getContentType().equals(tika.detect(bytes));
        } catch (IOException ex) {
            throw new CustomException(ExceptionCode.FILE_UPLOAD_FAIL);
        }
    }
}

package com.jh.backend.util.file;

import com.jh.backend.common.enums.MediaExt;
import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.common.properties.S3Properties;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.IOException;
import java.util.Locale;
import java.util.UUID;

/*
AWS S3 파일 관리
- Key : {dev, prod}/{폴더}/{UUID}.{확장자}
- 트랜잭션 안에서 업로드 : 롤백되면 업로드한 파일 삭제
- 트랜잭션 안에서 삭제 : 커밋된 이후에 삭제
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FileUtil {

    private static final int MAX_ORIGINAL_NAME = 200;

    private final S3Client s3Client;
    private final S3Properties s3Properties;
    private final ImageValidator imageValidator;

    // 이미지 업로드
    public UploadedFile upload(MultipartFile file, StorageFolder folder) {
        MediaExt ext = imageValidator.validate(file, folder.getAllowedExts());
        String s3Key = createKey(folder, ext);

        try {
            s3Client.putObject(request -> request
                    .bucket(s3Properties.bucket())
                    .key(s3Key)
                    .contentType(ext.getContentType())
                    .cacheControl("public, max-age=31536000, immutable"), RequestBody.fromBytes(file.getBytes()));
        } catch (SdkException ex) {
            log.error("S3 업로드 실패 - key = {}", s3Key, ex);
            throw new CustomException(ExceptionCode.API_BAD_GATEWAY);
        } catch (IOException ex) {
            log.error("파일 읽기 실패 - key = {}", s3Key, ex);
            throw new CustomException(ExceptionCode.FILE_UPLOAD_FAIL);
        }

        deleteOnRollback(s3Key);
        return new UploadedFile(toOriginalName(file), s3Key, formatFileSize(file.getSize()), ext);
    }

    // 파일 삭제 (실패해도 요청은 성공 처리)
    public void delete(String s3Key) {
        if (!StringUtils.hasText(s3Key)) return;

        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            deleteObject(s3Key);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteObject(s3Key);
            }
        });
    }

    // 공개 주소 생성
    public String toUrl(String s3Key) {
        return StringUtils.hasText(s3Key)
                ? StringUtils.trimTrailingCharacter(s3Properties.publicUrl(), '/') + "/" + s3Key
                : null;
    }

    private void deleteOnRollback(String s3Key) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    deleteObject(s3Key);
                }
            }
        });
    }

    private void deleteObject(String s3Key) {
        try {
            s3Client.deleteObject(request -> request.bucket(s3Properties.bucket()).key(s3Key));
        } catch (Exception ex) {
            log.error("S3 삭제 실패 - key = {}", s3Key, ex);
        }
    }

    private String createKey(StorageFolder folder, MediaExt ext) {
        return "%s/%s/%s.%s".formatted(s3Properties.folder(), folder.getPath(), UUID.randomUUID(), ext.name().toLowerCase(Locale.ROOT));
    }

    // 경로와 제어 문자를 제거하고, 길면 확장자가 남도록 뒷부분을 사용
    private String toOriginalName(MultipartFile file) {
        String name = StringUtils.getFilename(StringUtils.cleanPath(file.getOriginalFilename())).replaceAll("\\p{Cntrl}", "");
        return name.length() <= MAX_ORIGINAL_NAME ? name : name.substring(name.length() - MAX_ORIGINAL_NAME);
    }

    // 파일 크기 표기 (예: 9.4MB)
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + "B";
        if (bytes < 1024 * 1024) return String.format(Locale.ROOT, "%.1fKB", bytes / 1024.0);
        return String.format(Locale.ROOT, "%.1fMB", bytes / (1024.0 * 1024.0));
    }
}

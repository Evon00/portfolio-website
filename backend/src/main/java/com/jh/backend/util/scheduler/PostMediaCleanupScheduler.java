package com.jh.backend.util.scheduler;

import com.jh.backend.entity.PostMedia;
import com.jh.backend.repository.PostMediaRepository;
import com.jh.backend.util.file.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/*
미연결 게시글 이미지 정리 스케줄러
- 업로드 후 게시글에 연결되지 않은 이미지, 게시글 수정으로 연결 해제된 이미지를 정리합니다.
- soft delete된 이미지(게시글 삭제시 함께 삭제된 이미지)는 복구 대비로 제외합니다.
- 서버 1대 가정 (분산 락 없음)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PostMediaCleanupScheduler {

    private static final long UNLINKED_RETENTION_HOURS = 24;
    private static final int MAX_CLEANUP_COUNT = 500;

    private final PostMediaRepository postMediaRepository;
    private final FileUtil fileUtil;

    // 미연결 게시글 이미지 정리 (기본 매일 04:00, scheduler.post-media-cleanup.cron)
    @Scheduled(cron = "${scheduler.post-media-cleanup.cron}", zone = "Asia/Seoul")
    @Transactional
    public void cleanupUnlinkedPostMedias() {

        // 1. 정리 대상 조회
        //      -> post_id IS NULL, deleted_at IS NULL(@SQLRestriction), created_at < 현재 - 24시간
        //      -> 작성 중 업로드한 이미지가 지워지지 않도록 24시간 유예
        //      -> PK 오름차순 최대 500개 (나머지는 다음 실행에서 처리)
        //      -> 대상이 없으면 debug 로그 후 종료
        List<PostMedia> medias = postMediaRepository.findAllUnlinkedBefore(
                OffsetDateTime.now().minusHours(UNLINKED_RETENTION_HOURS), MAX_CLEANUP_COUNT);
        if (medias.isEmpty()) {
            log.debug("미연결 이미지 정리 - 대상 없음");
            return;
        }

        // 2. S3 파일 삭제 예약
        //      -> FileUtil.delete(s3Key) : 트랜잭션 커밋 후 삭제, 실패해도 예외 없이 로그만 기록
        medias.forEach(media -> fileUtil.delete(media.getS3Key()));

        // 3. DB 행 hard delete (DELETE 쿼리 1번)
        //      -> 한 번도 게시글에 쓰이지 않았거나 연결 해제된 이미지라 복구 불필요
        postMediaRepository.deleteAllInBatch(medias);

        // 4. 정리 로그 기록 (count)
        log.info("미연결 이미지 정리 - count = {}", medias.size());
    }
}

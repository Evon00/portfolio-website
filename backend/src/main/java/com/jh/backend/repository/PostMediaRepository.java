package com.jh.backend.repository;

import com.jh.backend.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

    // 게시글에 연결된 이미지 (삭제된 이미지 제외, PK 오름차순 = 업로드 순서)
    List<PostMedia> findAllByPostIdOrderByIdAsc(Long postId);

    // 미연결 이미지 정리 대상 (게시글 미연결, 삭제된 이미지 제외, 기준 시각 이전 업로드, PK 오름차순, 최대 limit개)
    //      -> native 쿼리로 post_id 컬럼만 비교 (JPQL은 Post의 @SQLRestriction 때문에 jh_post를 조인해
    //         삭제된 게시글의 이미지를 미연결로 판단하거나, 미연결 이미지를 찾지 못함)
    @Query(value = """
            SELECT * FROM jh_post_media
            WHERE post_id IS NULL AND deleted_at IS NULL AND created_at < :createdAt
            ORDER BY id
            LIMIT :limit
            """, nativeQuery = true)
    List<PostMedia> findAllUnlinkedBefore(@Param("createdAt") OffsetDateTime createdAt, @Param("limit") int limit);
}

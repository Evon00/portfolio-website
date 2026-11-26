package com.jh.backend.repository;

import com.jh.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 슬러그 사용 여부 (삭제된 게시글 제외, @SQLRestriction)
    boolean existsBySlug(String slug);

    // 슬러그로 게시글 조회 (삭제된 게시글 제외, @SQLRestriction)
    Optional<Post> findBySlug(String slug);

    // 조회수 1 증가 (동시 요청에도 덮어쓰지 않도록 쿼리로 증가, modified_at 미갱신)
    @Modifying
    @Query("UPDATE Post p SET p.view = p.view + 1 WHERE p.id = :postId")
    void increaseView(@Param("postId") Long postId);

    // 전체 조회수 합계 (삭제된 게시글 제외, @SQLRestriction, 게시글이 없으면 0)
    @Query("SELECT COALESCE(SUM(p.view), 0) FROM Post p")
    long sumView();

    // 게시글 목록 검색 (삭제된 게시글 제외, 정렬은 Pageable)
    //      -> keywordType이 null이면 검색 안 함
    //      -> SKILL은 EXISTS로 기술 스택 이름 비교 (게시글 중복 방지)
    @Query(value = """
            SELECT p FROM Post p
            WHERE :keywordType IS NULL
               OR (:keywordType = 'TITLE' AND LOWER(p.title) LIKE :pattern ESCAPE '\\')
               OR (:keywordType = 'CONTENT' AND LOWER(p.content) LIKE :pattern ESCAPE '\\')
               OR (:keywordType = 'TITLE_CONTENT' AND (LOWER(p.title) LIKE :pattern ESCAPE '\\' OR LOWER(p.content) LIKE :pattern ESCAPE '\\'))
               OR (:keywordType = 'SKILL' AND EXISTS (
                    SELECT 1 FROM PostSkill ps JOIN ps.skill s
                    WHERE ps.post = p AND LOWER(s.name) LIKE :pattern ESCAPE '\\'))
            """,
            countQuery = """
            SELECT COUNT(p) FROM Post p
            WHERE :keywordType IS NULL
               OR (:keywordType = 'TITLE' AND LOWER(p.title) LIKE :pattern ESCAPE '\\')
               OR (:keywordType = 'CONTENT' AND LOWER(p.content) LIKE :pattern ESCAPE '\\')
               OR (:keywordType = 'TITLE_CONTENT' AND (LOWER(p.title) LIKE :pattern ESCAPE '\\' OR LOWER(p.content) LIKE :pattern ESCAPE '\\'))
               OR (:keywordType = 'SKILL' AND EXISTS (
                    SELECT 1 FROM PostSkill ps JOIN ps.skill s
                    WHERE ps.post = p AND LOWER(s.name) LIKE :pattern ESCAPE '\\'))
            """)
    Page<Post> findAllBySearch(@Param("keywordType") String keywordType, @Param("pattern") String pattern, Pageable pageable);
}

package com.jh.backend.repository;

import com.jh.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 슬러그 사용 여부 (삭제된 게시글 제외, @SQLRestriction)
    boolean existsBySlug(String slug);
}

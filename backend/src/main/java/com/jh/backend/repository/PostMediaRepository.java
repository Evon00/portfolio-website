package com.jh.backend.repository;

import com.jh.backend.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

    // 게시글에 연결된 이미지 (삭제된 이미지 제외, PK 오름차순 = 업로드 순서)
    List<PostMedia> findAllByPostIdOrderByIdAsc(Long postId);
}

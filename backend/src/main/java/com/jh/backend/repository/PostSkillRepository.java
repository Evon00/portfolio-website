package com.jh.backend.repository;

import com.jh.backend.entity.PostSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PostSkillRepository extends JpaRepository<PostSkill, Long> {

    // 기술 스택을 사용하는 게시글 수 (삭제된 게시글 제외)
    @Query("""
            SELECT COUNT(ps) FROM PostSkill ps
            JOIN ps.post p
            WHERE ps.skill.id = :skillId AND p.deletedAt IS NULL
            """)
    long countBySkillId(@Param("skillId") Long skillId);

    // 게시글 목록의 기술 스택 (기술 스택 함께 조회, 게시글별 priority 오름차순)
    @Query("""
            SELECT ps FROM PostSkill ps
            JOIN FETCH ps.skill s
            WHERE ps.post.id IN :postIds
            ORDER BY ps.post.id ASC, ps.priority ASC
            """)
    List<PostSkill> findAllByPostIdIn(@Param("postIds") Collection<Long> postIds);
}

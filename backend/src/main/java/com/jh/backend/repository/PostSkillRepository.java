package com.jh.backend.repository;

import com.jh.backend.entity.PostSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostSkillRepository extends JpaRepository<PostSkill, Long> {

    // 기술 스택을 사용하는 게시글 수 (삭제된 게시글 제외)
    @Query("""
            SELECT COUNT(ps) FROM PostSkill ps
            JOIN ps.post p
            WHERE ps.skill.id = :skillId AND p.deletedAt IS NULL
            """)
    long countBySkillId(@Param("skillId") Long skillId);
}

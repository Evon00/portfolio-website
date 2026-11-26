package com.jh.backend.repository;

import com.jh.backend.entity.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, Long> {

    // 기술 스택을 사용하는 프로젝트 수 (삭제된 프로젝트 제외)
    @Query("""
            SELECT COUNT(ps) FROM ProjectSkill ps
            JOIN ps.project p
            WHERE ps.skill.id = :skillId AND p.deletedAt IS NULL
            """)
    long countBySkillId(@Param("skillId") Long skillId);
}

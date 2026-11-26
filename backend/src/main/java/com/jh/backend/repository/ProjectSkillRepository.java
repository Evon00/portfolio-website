package com.jh.backend.repository;

import com.jh.backend.entity.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, Long> {

    // 기술 스택을 사용하는 프로젝트 수 (삭제된 프로젝트 제외)
    @Query("""
            SELECT COUNT(ps) FROM ProjectSkill ps
            JOIN ps.project p
            WHERE ps.skill.id = :skillId AND p.deletedAt IS NULL
            """)
    long countBySkillId(@Param("skillId") Long skillId);

    // 프로젝트 기술 스택 조회 (기술 스택 함께 조회, 프로젝트별 priority 오름차순)
    @Query("""
            SELECT ps FROM ProjectSkill ps
            JOIN FETCH ps.skill s
            WHERE ps.project.id IN :projectIds
            ORDER BY ps.project.id ASC, ps.priority ASC
            """)
    List<ProjectSkill> findAllByProjectIdIn(@Param("projectIds") Collection<Long> projectIds);
}

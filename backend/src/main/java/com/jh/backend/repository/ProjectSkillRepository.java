package com.jh.backend.repository;

import com.jh.backend.entity.ProjectSkill;
import com.jh.backend.repository.projection.SkillUsageCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    // 기술 스택별 사용 수 (삭제된 프로젝트 제외, 사용 수 내림차순, 같으면 skillId 오름차순)
    @Query("""
            SELECT s.id AS skillId, s.name AS skillName, COUNT(ps) AS usageCount
            FROM ProjectSkill ps
            JOIN ps.skill s
            JOIN ps.project p
            WHERE p.deletedAt IS NULL
            GROUP BY s.id, s.name
            ORDER BY COUNT(ps) DESC, s.id ASC
            """)
    List<SkillUsageCount> countAllGroupBySkill();

    // 프로젝트 기술 스택 조회 (기술 스택 함께 조회, 프로젝트별 priority 오름차순)
    @Query("""
            SELECT ps FROM ProjectSkill ps
            JOIN FETCH ps.skill s
            WHERE ps.project.id IN :projectIds
            ORDER BY ps.project.id ASC, ps.priority ASC
            """)
    List<ProjectSkill> findAllByProjectIdIn(@Param("projectIds") Collection<Long> projectIds);

    // 프로젝트 기술 스택 일괄 삭제 (바로 실행, 다시 저장할 때 유니크 제약 위반 방지)
    @Modifying
    @Query("DELETE FROM ProjectSkill ps WHERE ps.project.id = :projectId")
    void deleteAllByProjectId(@Param("projectId") Long projectId);
}

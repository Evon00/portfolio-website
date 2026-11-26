package com.jh.backend.repository;

import com.jh.backend.entity.AdminSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminSkillRepository extends JpaRepository<AdminSkill, Long> {

    // 기술 스택이 관리자 프로필에서 사용 중인지 여부 (삭제된 관리자 제외)
    @Query("""
            SELECT CASE WHEN COUNT(ak) > 0 THEN true ELSE false END FROM AdminSkill ak
            JOIN ak.admin a
            WHERE ak.skill.id = :skillId AND a.deletedAt IS NULL
            """)
    boolean existsBySkillId(@Param("skillId") Long skillId);
}

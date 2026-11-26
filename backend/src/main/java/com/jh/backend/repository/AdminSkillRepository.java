package com.jh.backend.repository;

import com.jh.backend.entity.AdminSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdminSkillRepository extends JpaRepository<AdminSkill, Long> {

    // 기술 스택이 관리자 프로필에서 사용 중인지 여부 (삭제된 관리자 제외)
    @Query("""
            SELECT CASE WHEN COUNT(ak) > 0 THEN true ELSE false END FROM AdminSkill ak
            JOIN ak.admin a
            WHERE ak.skill.id = :skillId AND a.deletedAt IS NULL
            """)
    boolean existsBySkillId(@Param("skillId") Long skillId);

    // 관리자의 핵심 기술 스택 (기술 스택 함께 조회, 삭제된 기술 스택 제외, priority 오름차순)
    @Query("""
            SELECT ak FROM AdminSkill ak
            JOIN FETCH ak.skill s
            WHERE ak.admin.id = :adminId AND s.deletedAt IS NULL
            ORDER BY ak.priority ASC, ak.id ASC
            """)
    List<AdminSkill> findAllByAdminId(@Param("adminId") Long adminId);

    // 관리자의 핵심 기술 스택 일괄 삭제 (바로 실행되어 다시 저장해도 유니크 제약 위반 없음)
    @Modifying
    @Query("DELETE FROM AdminSkill ak WHERE ak.admin.id = :adminId")
    void deleteAllByAdminId(@Param("adminId") Long adminId);
}

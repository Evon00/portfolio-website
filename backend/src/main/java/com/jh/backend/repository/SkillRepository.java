package com.jh.backend.repository;

import com.jh.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    boolean existsByNameIgnoreCase(String name);

    // 카테고리(정확히 일치), 이름 검색 패턴(소문자, escape 처리된 LIKE 패턴)으로 조회 - null이면 조건 제외
    @Query("""
            SELECT s FROM Skill s
            WHERE (:category IS NULL OR s.category = :category)
              AND (:namePattern IS NULL OR LOWER(s.name) LIKE :namePattern ESCAPE '\\')
            ORDER BY s.createdAt DESC, s.id DESC
            """)
    List<Skill> findAllBySearch(@Param("category") String category, @Param("namePattern") String namePattern);

    // 카테고리 목록 (중복 제거, 정렬은 서비스에서 처리)
    @Query("SELECT DISTINCT s.category FROM Skill s")
    List<String> findAllCategories();
}

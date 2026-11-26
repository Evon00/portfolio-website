package com.jh.backend.repository;

import com.jh.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // 슬러그 사용 여부 (삭제된 프로젝트 제외, @SQLRestriction)
    boolean existsBySlug(String slug);

    // 프로젝트 순서 최댓값 (삭제된 프로젝트 제외, 프로젝트가 없으면 0)
    @Query("SELECT COALESCE(MAX(p.priority), 0) FROM Project p")
    int findMaxPriority();
}

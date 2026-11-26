package com.jh.backend.repository;

import com.jh.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // 슬러그 사용 여부 (삭제된 프로젝트 제외, @SQLRestriction)
    boolean existsBySlug(String slug);
}

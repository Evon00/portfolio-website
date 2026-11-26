package com.jh.backend.repository;

import com.jh.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // 슬러그 사용 여부 (삭제된 프로젝트 제외, @SQLRestriction)
    boolean existsBySlug(String slug);

    // 슬러그로 프로젝트 조회 (삭제된 프로젝트 제외, @SQLRestriction)
    Optional<Project> findBySlug(String slug);

    // 프로젝트 순서 최댓값 (삭제된 프로젝트 제외, 프로젝트가 없으면 0)
    @Query("SELECT COALESCE(MAX(p.priority), 0) FROM Project p")
    int findMaxPriority();

    // 프로젝트 전체 (삭제된 프로젝트 제외, priority 오름차순, 같으면 PK 오름차순)
    List<Project> findAllByOrderByPriorityAscIdAsc();
}

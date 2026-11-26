package com.jh.backend.repository;

import com.jh.backend.entity.ProjectMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ProjectMediaRepository extends JpaRepository<ProjectMedia, Long> {

    // 프로젝트별 이미지 수 (삭제된 이미지 제외, 이미지가 없는 프로젝트는 결과에 없음)
    @Query("""
            SELECT pm.project.id AS projectId, COUNT(pm) AS mediaCount FROM ProjectMedia pm
            WHERE pm.project.id IN :projectIds
            GROUP BY pm.project.id
            """)
    List<ProjectMediaCount> countAllByProjectIdIn(@Param("projectIds") Collection<Long> projectIds);

    // 프로젝트별 이미지 수 조회 결과
    interface ProjectMediaCount {

        Long getProjectId();

        long getMediaCount();
    }
}

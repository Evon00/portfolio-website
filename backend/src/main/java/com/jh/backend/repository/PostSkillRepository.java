package com.jh.backend.repository;

import com.jh.backend.entity.PostSkill;
import com.jh.backend.repository.projection.SkillUsageCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PostSkillRepository extends JpaRepository<PostSkill, Long> {

    // 기술 스택을 사용하는 게시글 수 (삭제된 게시글 제외)
    @Query("""
            SELECT COUNT(ps) FROM PostSkill ps
            JOIN ps.post p
            WHERE ps.skill.id = :skillId AND p.deletedAt IS NULL
            """)
    long countBySkillId(@Param("skillId") Long skillId);

    // 기술 스택별 사용 수 (삭제된 게시글 제외, 사용 수 내림차순, 같으면 skillId 오름차순)
    @Query("""
            SELECT s.id AS skillId, s.name AS skillName, COUNT(ps) AS usageCount
            FROM PostSkill ps
            JOIN ps.skill s
            JOIN ps.post p
            WHERE p.deletedAt IS NULL
            GROUP BY s.id, s.name
            ORDER BY COUNT(ps) DESC, s.id ASC
            """)
    List<SkillUsageCount> countAllGroupBySkill();

    // 게시글 목록의 기술 스택 (기술 스택 함께 조회, 게시글별 priority 오름차순)
    @Query("""
            SELECT ps FROM PostSkill ps
            JOIN FETCH ps.skill s
            WHERE ps.post.id IN :postIds
            ORDER BY ps.post.id ASC, ps.priority ASC
            """)
    List<PostSkill> findAllByPostIdIn(@Param("postIds") Collection<Long> postIds);

    // 게시글의 기술 스택 일괄 삭제 (바로 실행되어 다시 저장해도 유니크 제약 위반 없음)
    @Modifying
    @Query("DELETE FROM PostSkill ps WHERE ps.post.id = :postId")
    void deleteAllByPostId(@Param("postId") Long postId);
}

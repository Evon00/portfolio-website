package com.jh.backend.repository.projection;

// 기술 스택별 사용 수 조회 결과 (게시글, 프로젝트 공용)
public interface SkillUsageCount {

    Long getSkillId();

    String getSkillName();

    long getUsageCount();
}

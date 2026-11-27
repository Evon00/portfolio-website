package com.jh.backend.util.project;

import com.jh.backend.dto.project.item.ProjectSkillItem;
import com.jh.backend.repository.ProjectSkillRepository;
import com.jh.backend.util.file.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/*
프로젝트 목록 조회
- 관리자 프로젝트 목록, 공개 프로젝트 목록에서 같은 기술 스택 조회를 사용합니다.
 */
@Component
@RequiredArgsConstructor
public class ProjectReader {

    private final ProjectSkillRepository projectSkillRepository;
    private final FileUtil fileUtil;

    // 프로젝트별 기술 스택 조회 (IN 쿼리 1번, N+1 방지)
    //      -> 조회할 프로젝트가 없으면 생략
    //      -> 프로젝트별 priority 오름차순
    //      -> skillUrl은 s3 key를 공개 주소로 변환
    public Map<Long, List<ProjectSkillItem>> readSkillsByProjectId(List<Long> projectIds) {
        if (projectIds.isEmpty()) return Map.of();
        return projectSkillRepository.findAllByProjectIdIn(projectIds).stream()
                .collect(Collectors.groupingBy(projectSkill -> projectSkill.getProject().getId(),
                        Collectors.mapping(projectSkill -> ProjectSkillItem.fromEntity(projectSkill, fileUtil.toUrl(projectSkill.getSkill().getS3Key())),
                                Collectors.toList())));
    }
}

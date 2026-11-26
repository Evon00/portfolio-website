package com.jh.backend.service.implement;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.project.item.FindAllProjectsItem;
import com.jh.backend.dto.project.item.ProjectSkillItem;
import com.jh.backend.dto.project.request.FindAllProjectsRequestDto;
import com.jh.backend.entity.Project;
import com.jh.backend.repository.ProjectMediaRepository;
import com.jh.backend.repository.ProjectRepository;
import com.jh.backend.service.ProjectService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.project.ProjectReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final int DEFAULT_PAGE_SIZE = 6;

    private final ProjectRepository projectRepository;
    private final ProjectMediaRepository projectMediaRepository;
    private final ProjectReader projectReader;
    private final FileUtil fileUtil;

    // 공개 프로젝트 목록 조회 (인증 불필요, 메인 주요 프로젝트 캐러셀도 사용)
    //      -> 검색, 정렬 조건 없음 (projectPriority 오름차순 고정)
    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<FindAllProjectsItem> findAllProjects(FindAllProjectsRequestDto dto) {

        // 1. 페이지 조건 정리
        //      -> 기본값 : pageNumber 0, pageSize 6
        //      -> priority 오름차순, 같으면 PK 오름차순 (페이지 이동시 순서 고정)
        PageRequest pageRequest = PageRequest.of(
                dto.pageNumber() != null ? dto.pageNumber() : DEFAULT_PAGE_NUMBER,
                dto.pageSize() != null ? dto.pageSize() : DEFAULT_PAGE_SIZE,
                Sort.by(Sort.Order.asc("priority"), Sort.Order.asc("id")));

        // 2. 프로젝트 페이지 조회 (count 쿼리 포함)
        //      -> 삭제된 프로젝트 제외 (@SQLRestriction)
        Page<Project> projects = projectRepository.findAll(pageRequest);
        List<Long> projectIds = projects.map(Project::getId).toList();

        // 3. 프로젝트 기술 스택 조회 (ProjectReader, IN 쿼리 1번)
        //      -> 조회된 프로젝트가 없으면 생략
        //      -> 프로젝트별 priority 오름차순
        Map<Long, List<ProjectSkillItem>> skillsByProjectId = projectReader.readSkillsByProjectId(projectIds);

        // 4. 프로젝트별 대표 이미지 조회 (IN 쿼리 1번)
        //      -> 조회된 프로젝트가 없으면 생략
        //      -> 삭제된 이미지 제외 (@SQLRestriction), 프로젝트당 최대 1개 (부분 유니크 인덱스)
        //      -> s3 key를 공개 주소로 변환, 대표 이미지가 없으면 null
        Map<Long, String> mediaUrlByProjectId = projectIds.isEmpty() ? Map.of()
                : projectMediaRepository.findAllByProjectIdInAndImportantTrue(projectIds).stream()
                        .collect(Collectors.toMap(media -> media.getProject().getId(), media -> fileUtil.toUrl(media.getS3Key())));

        // 5. 응답 DTO로 변환
        //      -> 본문(projectContent)은 응답하지 않음
        //      -> 범위를 넘은 페이지는 빈 목록
        return PageResponseDto.of(projects, projects.stream()
                .map(project -> FindAllProjectsItem.fromEntity(project,
                        mediaUrlByProjectId.get(project.getId()),
                        skillsByProjectId.getOrDefault(project.getId(), List.of())))
                .toList());
    }
}

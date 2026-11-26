package com.jh.backend.service.implement;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.project.item.FindAllAdminProjectsItem;
import com.jh.backend.dto.project.item.FindProjectMediaItem;
import com.jh.backend.dto.project.item.ProjectSkillItem;
import com.jh.backend.dto.project.item.CreateProjectMediaItem;
import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.request.CreateProjectRequestDto;
import com.jh.backend.dto.project.request.FindAllAdminProjectsRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.dto.project.response.CreateProjectResponseDto;
import com.jh.backend.dto.project.response.FindProjectResponseDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.entity.Project;
import com.jh.backend.entity.ProjectMedia;
import com.jh.backend.entity.ProjectSkill;
import com.jh.backend.entity.Skill;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
import com.jh.backend.repository.ProjectMediaRepository;
import com.jh.backend.repository.ProjectMediaRepository.ProjectMediaCount;
import com.jh.backend.repository.ProjectRepository;
import com.jh.backend.repository.ProjectSkillRepository;
import com.jh.backend.service.AdminProjectService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.file.UploadedFile;
import com.jh.backend.util.login.LoginChecker;
import com.jh.backend.util.skill.SkillReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProjectServiceImpl implements AdminProjectService {

    private static final int MAX_PROJECT_MEDIA_COUNT = 10;
    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final int DEFAULT_PAGE_SIZE = 10;

    private final AdminRepository adminRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final ProjectMediaRepository projectMediaRepository;
    private final SkillReader skillReader;
    private final LoginChecker loginChecker;
    private final FileUtil fileUtil;

    // 프로젝트 슬러그 중복 확인
    //      -> 슬러그 형식(영문 소문자, 숫자, 하이픈, 최대 100자)은 DTO에서 검증 (형식 오류시 400)
    //      -> 중복이어도 에러가 아닌 available = false로 응답
    @Override
    @Transactional(readOnly = true)
    public CheckProjectSlugResponseDto checkProjectSlug(CheckProjectSlugRequestDto dto) {

        // 1. 슬러그 사용 여부 확인
        //      -> 삭제되지 않은 프로젝트 중 같은 슬러그가 있는지 확인
        //      -> 삭제된 프로젝트의 슬러그는 사용 가능으로 판단 (@SQLRestriction, DB 유니크 인덱스도 삭제되지 않은 프로젝트만 대상)
        boolean exists = projectRepository.existsBySlug(dto.projectSlug());

        // 2. 응답 DTO로 변환
        //      -> 같은 슬러그가 없으면 available = true
        return new CheckProjectSlugResponseDto(dto.projectSlug(), !exists);
    }

    // 프로젝트 추가 (multipart : data + files)
    //      -> 검증을 모두 통과한 뒤 S3 업로드 (검증 실패 요청은 업로드하지 않음)
    //      -> 업로드 후 실패로 롤백되면 업로드한 파일은 S3에서 삭제 (FileUtil)
    @Override
    @Transactional
    public CreateProjectResponseDto createProject(CreateProjectRequestDto dto, List<MultipartFile> files) {

        // 1. 로그인한 관리자 조회
        //      -> 토큰의 관리자 PK 사용 (LoginChecker)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        Admin admin = adminRepository.findById(loginChecker.getAdminId()).orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 날짜 범위 확인
        //      exc. 종료일이 시작일보다 이르면 에러 처리 (DATE_RANGE_INVALID, 400)
        //      -> 종료일이 null이면 진행 중 (확인 생략)
        if (dto.projectEndDate() != null && dto.projectEndDate().isBefore(dto.projectStartDate())) {
            throw new CustomException(ExceptionCode.DATE_RANGE_INVALID);
        }

        // 3. 슬러그 중복 확인
        //      -> 삭제된 프로젝트의 슬러그는 사용 가능 (@SQLRestriction)
        //      exc. 같은 슬러그의 프로젝트가 있으면 에러 처리 (PROJECT_SLUG_DUPLICATED, 409)
        //      -> 동시 요청으로 같은 슬러그가 저장되면 DB 유니크 인덱스에서 에러 처리 (DATA_INTEGRITY_VIOLATION)
        if (projectRepository.existsBySlug(dto.projectSlug())) {
            throw new CustomException(ExceptionCode.PROJECT_SLUG_DUPLICATED);
        }

        // 4. 기술 스택 조회 (SkillReader, 요청 순서 유지)
        //      exc. 중복 ID가 있으면 에러 처리 (SKILL_ID_DUPLICATED, 400)
        //      exc. 존재하지 않거나 삭제된 ID가 있으면 에러 처리 (SKILL_ID_INVALID, 400, data에 해당 ID 목록)
        List<Skill> skills = skillReader.readAllInOrder(dto.skillIds());

        // 5. 파일, 이미지 정보 검증 (files, projectMedias가 null이면 빈 목록)
        //      exc. 파일이 10개 초과면 에러 처리 (FILE_COUNT_EXCEED, 400)
        //      exc. 이미지 정보 개수와 파일 개수가 다르면 에러 처리 (PROJECT_MEDIA_INVALID, 400)
        //          -> 파일 없이 이미지 정보만 있거나, 이미지 정보 없이 파일만 있는 경우 포함
        //      exc. fileIndex가 파일 범위(0 ~ 파일 개수 - 1)를 벗어나거나 중복이면 에러 처리 (PROJECT_MEDIA_INVALID, 400)
        //          -> 개수가 같고 범위 안에서 중복이 없으면 모든 파일이 정확히 한 번씩 연결됨
        //      exc. 대표 이미지가 2개 이상이면 에러 처리 (PROJECT_MEDIA_IMPORTANT_DUPLICATED, 400)
        //      -> 파일 형식, 용량은 업로드시 FileUtil에서 검증 (FILE_REQUIRED, FILE_TYPE_INVALID, FILE_SIZE_EXCEED)
        List<MultipartFile> mediaFiles = files != null ? files : List.of();
        List<CreateProjectMediaItem> medias = dto.projectMedias() != null ? dto.projectMedias() : List.of();
        validateProjectMedias(mediaFiles, medias);

        // 6. 프로젝트 저장
        //      -> priority는 삭제되지 않은 프로젝트의 최댓값 + 1 (없으면 1, 목록 맨 뒤)
        //      -> projectGithubIsPublic이 null이면 false
        //      -> URL은 DTO에서 공백 제거 후 비어 있으면 null
        Project project = projectRepository.save(Project.builder()
                .admin(admin)
                .title(dto.projectTitle())
                .summary(dto.projectSummary())
                .content(dto.projectContent())
                .githubUrl(dto.projectGithubUrl())
                .githubIsPublic(Boolean.TRUE.equals(dto.projectGithubIsPublic()))
                .url(dto.projectUrl())
                .startDate(dto.projectStartDate())
                .endDate(dto.projectEndDate())
                .slug(dto.projectSlug())
                .priority(projectRepository.findMaxPriority() + 1)
                .build());

        // 7. 프로젝트 기술 스택 저장 (saveAll)
        //      -> priority는 요청 배열 순서대로 1부터
        projectSkillRepository.saveAll(IntStream.range(0, skills.size())
                .mapToObj(i -> ProjectSkill.builder()
                        .project(project)
                        .skill(skills.get(i))
                        .priority(i + 1)
                        .build())
                .toList());

        // 8. 이미지 업로드 + 프로젝트 이미지 저장 (projectMedias 배열 순서대로)
        //      -> fileIndex의 파일을 업로드 (StorageFolder.PROJECT)
        //      -> 원본 파일명, s3 key, 크기(9.4MB 형식), 확장자, 캡션, 대표 여부 저장
        //      -> priority는 projectMedias 배열 순서대로 1부터
        //      -> 대표 여부가 null이면 false
        projectMediaRepository.saveAll(IntStream.range(0, medias.size())
                .mapToObj(i -> {
                    CreateProjectMediaItem media = medias.get(i);
                    UploadedFile image = fileUtil.upload(mediaFiles.get(media.fileIndex()), StorageFolder.PROJECT);
                    return ProjectMedia.builder()
                            .project(project)
                            .originalName(image.originalName())
                            .s3Key(image.s3Key())
                            .size(image.size())
                            .ext(image.ext())
                            .caption(media.projectMediaCaption())
                            .important(Boolean.TRUE.equals(media.projectMediaIsImportant()))
                            .priority(i + 1)
                            .build();
                })
                .toList());

        // 9. 추가 로그 기록 (projectId)
        log.info("프로젝트 추가 - projectId = {}", project.getId());

        // 10. 응답 DTO로 변환
        return CreateProjectResponseDto.fromEntity(project);
    }

    // 관리자 프로젝트 목록 조회
    //      -> 검색, 정렬 조건 없음 (projectPriority 오름차순 고정)
    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<FindAllAdminProjectsItem> findAllAdminProjects(FindAllAdminProjectsRequestDto dto) {

        // 1. 페이지 조건 정리
        //      -> 기본값 : pageNumber 0, pageSize 10
        //      -> priority 오름차순, 같으면 PK 오름차순 (페이지 이동시 순서 고정)
        PageRequest pageRequest = PageRequest.of(
                dto.pageNumber() != null ? dto.pageNumber() : DEFAULT_PAGE_NUMBER,
                dto.pageSize() != null ? dto.pageSize() : DEFAULT_PAGE_SIZE,
                Sort.by(Sort.Order.asc("priority"), Sort.Order.asc("id")));

        // 2. 프로젝트 페이지 조회 (count 쿼리 포함)
        //      -> 삭제된 프로젝트 제외 (@SQLRestriction)
        Page<Project> projects = projectRepository.findAll(pageRequest);
        List<Long> projectIds = projects.map(Project::getId).toList();

        // 3. 프로젝트 기술 스택 조회 (IN 쿼리 1번, N+1 방지)
        //      -> 조회된 프로젝트가 없으면 생략
        //      -> 프로젝트별 priority 오름차순
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        Map<Long, List<ProjectSkillItem>> skillsByProjectId = projectIds.isEmpty() ? Map.of()
                : projectSkillRepository.findAllByProjectIdIn(projectIds).stream()
                        .collect(Collectors.groupingBy(projectSkill -> projectSkill.getProject().getId(),
                                Collectors.mapping(projectSkill -> ProjectSkillItem.fromEntity(projectSkill, fileUtil.toUrl(projectSkill.getSkill().getS3Key())),
                                        Collectors.toList())));

        // 4. 프로젝트별 이미지 수 조회 (GROUP BY 쿼리 1번)
        //      -> 조회된 프로젝트가 없으면 생략
        //      -> 삭제된 이미지 제외 (@SQLRestriction), 이미지가 없으면 0
        Map<Long, Long> mediaCountByProjectId = projectIds.isEmpty() ? Map.of()
                : projectMediaRepository.countAllByProjectIdIn(projectIds).stream()
                        .collect(Collectors.toMap(ProjectMediaCount::getProjectId, ProjectMediaCount::getMediaCount));

        // 5. 응답 DTO로 변환
        //      -> 범위를 넘은 페이지는 빈 목록
        return PageResponseDto.of(projects, projects.stream()
                .map(project -> FindAllAdminProjectsItem.fromEntity(project,
                        mediaCountByProjectId.getOrDefault(project.getId(), 0L),
                        skillsByProjectId.getOrDefault(project.getId(), List.of())))
                .toList());
    }

    // 프로젝트 상세 조회 (수정용)
    //      -> 관리자 수정 화면용 (공개 상세 조회와 별도)
    //      -> 경로 변수 projectId는 컨트롤러에서 @Positive 검증 (0 이하면 400)
    @Override
    @Transactional(readOnly = true)
    public FindProjectResponseDto findProject(Long projectId) {

        // 1. 프로젝트 조회
        //      -> 삭제된 프로젝트 제외 (@SQLRestriction)
        //      exc. 프로젝트 미존재시 에러 처리 (PROJECT_NOT_FOUND, 404)
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new CustomException(ExceptionCode.PROJECT_NOT_FOUND));

        // 2. 프로젝트 기술 스택 조회 (기존 findAllByProjectIdIn 재사용, 기술 스택 함께 조회)
        //      -> priority 오름차순
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        List<ProjectSkillItem> skills = projectSkillRepository.findAllByProjectIdIn(List.of(projectId)).stream()
                .map(projectSkill -> ProjectSkillItem.fromEntity(projectSkill, fileUtil.toUrl(projectSkill.getSkill().getS3Key())))
                .toList();

        // 3. 프로젝트 이미지 조회
        //      -> 삭제된 이미지 제외 (@SQLRestriction)
        //      -> priority 오름차순, 같으면 PK 오름차순
        //      -> projectMediaUrl은 s3 key를 공개 주소로 변환
        List<FindProjectMediaItem> projectMedias = projectMediaRepository.findAllByProjectIdOrderByPriorityAscIdAsc(projectId).stream()
                .map(media -> FindProjectMediaItem.fromEntity(media, fileUtil.toUrl(media.getS3Key())))
                .toList();

        // 4. 응답 DTO로 변환
        //      -> 본문은 저장된 원문 그대로 응답
        return FindProjectResponseDto.fromEntity(project, skills, projectMedias);
    }

    // 파일, 이미지 정보 검증
    //      exc. 파일 10개 초과 (FILE_COUNT_EXCEED)
    //      exc. 이미지 정보와 파일 개수 불일치, fileIndex 범위 밖 또는 중복 (PROJECT_MEDIA_INVALID)
    //      exc. 대표 이미지 2개 이상 (PROJECT_MEDIA_IMPORTANT_DUPLICATED)
    private void validateProjectMedias(List<MultipartFile> files, List<CreateProjectMediaItem> medias) {
        if (files.size() > MAX_PROJECT_MEDIA_COUNT) {
            throw new CustomException(ExceptionCode.FILE_COUNT_EXCEED);
        }
        if (medias.size() != files.size()) {
            throw new CustomException(ExceptionCode.PROJECT_MEDIA_INVALID);
        }
        Set<Integer> fileIndexes = new HashSet<>();
        for (CreateProjectMediaItem media : medias) {
            if (media.fileIndex() >= files.size() || !fileIndexes.add(media.fileIndex())) {
                throw new CustomException(ExceptionCode.PROJECT_MEDIA_INVALID);
            }
        }
        if (medias.stream().filter(media -> Boolean.TRUE.equals(media.projectMediaIsImportant())).count() > 1) {
            throw new CustomException(ExceptionCode.PROJECT_MEDIA_IMPORTANT_DUPLICATED);
        }
    }
}

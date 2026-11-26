package com.jh.backend.service.implement;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.project.item.FindAllAdminProjectsItem;
import com.jh.backend.dto.project.item.FindProjectMediaItem;
import com.jh.backend.dto.project.item.ProjectSkillItem;
import com.jh.backend.dto.project.item.UpdateProjectMediaItem;
import com.jh.backend.dto.project.item.CreateProjectMediaItem;
import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.request.CreateProjectRequestDto;
import com.jh.backend.dto.project.request.FindAllAdminProjectsRequestDto;
import com.jh.backend.dto.project.request.UpdateProjectRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.dto.project.response.CreateProjectResponseDto;
import com.jh.backend.dto.project.response.FindProjectResponseDto;
import com.jh.backend.dto.project.response.UpdateProjectResponseDto;
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

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
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

    // 프로젝트 수정 (PATCH, multipart : data + files)
    //      -> 보낸 필드만 수정, null이면 기존 값 유지 (공백 제목·요약·본문은 DTO에서 400)
    //      -> 종료일, GitHub 주소, 사이트 주소는 빈 문자열이면 지움 (null로 저장)
    //      -> 슬러그는 수정 불가
    //      -> 경로 변수 projectId는 컨트롤러에서 @Positive 검증 (0 이하면 400)
    //      -> 검증을 모두 통과한 뒤 새 이미지 S3 업로드, 실패로 롤백되면 업로드한 파일 삭제 (FileUtil)
    @Override
    @Transactional
    public UpdateProjectResponseDto updateProject(Long projectId, UpdateProjectRequestDto dto, List<MultipartFile> files) {

        // 1. 프로젝트 조회
        //      -> 삭제된 프로젝트 제외 (@SQLRestriction)
        //      exc. 프로젝트 미존재시 에러 처리 (PROJECT_NOT_FOUND, 404)
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new CustomException(ExceptionCode.PROJECT_NOT_FOUND));

        // 2. 최종 값 결정
        //      -> 제목, 요약, 본문, 시작일, 공개 여부 : null이면 기존 값
        //      -> 종료일, GitHub 주소, 사이트 주소 : null이면 기존 값, 빈 문자열이면 null, 그 외 보낸 값
        //      exc. 종료일이 존재하지 않는 날짜(2026-02-30 등)면 에러 처리 (VALID_ERROR, 400)
        String title = dto.projectTitle() != null ? dto.projectTitle() : project.getTitle();
        String summary = dto.projectSummary() != null ? dto.projectSummary() : project.getSummary();
        String content = dto.projectContent() != null ? dto.projectContent() : project.getContent();
        LocalDate startDate = dto.projectStartDate() != null ? dto.projectStartDate() : project.getStartDate();
        LocalDate endDate = dto.projectEndDate() == null ? project.getEndDate()
                : dto.projectEndDate().isEmpty() ? null : parseDate(dto.projectEndDate());
        String githubUrl = dto.projectGithubUrl() == null ? project.getGithubUrl() : emptyToNull(dto.projectGithubUrl());
        boolean githubIsPublic = dto.projectGithubIsPublic() != null ? dto.projectGithubIsPublic() : project.isGithubIsPublic();
        String url = dto.projectUrl() == null ? project.getUrl() : emptyToNull(dto.projectUrl());

        // 3. 날짜 범위 확인 (최종 값 기준)
        //      exc. 최종 종료일이 최종 시작일보다 이르면 에러 처리 (DATE_RANGE_INVALID, 400)
        if (endDate != null && endDate.isBefore(startDate)) {
            throw new CustomException(ExceptionCode.DATE_RANGE_INVALID);
        }

        // 4. 기술 스택 조회 (skillIds를 보낸 경우만, SkillReader로 요청 순서 유지)
        //      exc. 중복 ID가 있으면 에러 처리 (SKILL_ID_DUPLICATED, 400)
        //      exc. 존재하지 않거나 삭제된 ID가 있으면 에러 처리 (SKILL_ID_INVALID, 400, data에 해당 ID 목록)
        List<Skill> skills = dto.skillIds() != null ? skillReader.readAllInOrder(dto.skillIds()) : null;

        // 5. 이미지 정보 검증 (files가 null이면 빈 목록)
        //      -> projectMedias가 null이면 이미지 유지
        //          exc. 이때 파일을 보내면 에러 처리 (PROJECT_MEDIA_INVALID, 400)
        //      -> projectMedias를 보낸 경우 최종 갤러리 전체로 판단 (빈 배열이면 전체 삭제)
        //          -> 현재 프로젝트 이미지 조회 (삭제된 이미지 제외)
        //          exc. 파일이 10개 초과면 에러 처리 (FILE_COUNT_EXCEED, 400)
        //          exc. 각 항목은 projectMediaId, fileIndex 중 정확히 하나만 (둘 다 있거나 둘 다 없으면 PROJECT_MEDIA_INVALID, 400)
        //          exc. projectMediaId가 이 프로젝트의 이미지가 아니거나 중복이면 에러 처리 (PROJECT_MEDIA_INVALID, 400)
        //          exc. fileIndex 항목 수와 파일 수가 다르거나, 범위 밖이거나 중복이면 에러 처리 (PROJECT_MEDIA_INVALID, 400)
        //          exc. 대표 이미지가 2개 이상이면 에러 처리 (PROJECT_MEDIA_IMPORTANT_DUPLICATED, 400)
        List<MultipartFile> mediaFiles = files != null ? files : List.of();
        List<UpdateProjectMediaItem> medias = dto.projectMedias();
        List<ProjectMedia> currentMedias = List.of();
        if (medias == null) {
            if (!mediaFiles.isEmpty()) {
                throw new CustomException(ExceptionCode.PROJECT_MEDIA_INVALID);
            }
        } else {
            currentMedias = projectMediaRepository.findAllByProjectIdOrderByPriorityAscIdAsc(projectId);
            validateUpdateProjectMedias(mediaFiles, medias, currentMedias);
        }

        // 6. 프로젝트 수정 (변경 감지, Project.update)
        project.update(title, summary, content, githubUrl, githubIsPublic, url, startDate, endDate);

        // 7. 기술 스택 교체 (skillIds를 보낸 경우만)
        //      -> 기존 기술 스택 순서(priority 오름차순)와 같으면 변경 없음
        //      -> 다르면 일괄 삭제(@Modifying, 바로 실행) 후 priority 1부터 다시 저장 (유니크 제약 위반 방지)
        if (skills != null) {
            List<Long> currentSkillIds = projectSkillRepository.findAllByProjectIdIn(List.of(projectId)).stream()
                    .map(projectSkill -> projectSkill.getSkill().getId())
                    .toList();
            if (!currentSkillIds.equals(dto.skillIds())) {
                projectSkillRepository.deleteAllByProjectId(projectId);
                projectSkillRepository.saveAll(IntStream.range(0, skills.size())
                        .mapToObj(i -> ProjectSkill.builder()
                                .project(project)
                                .skill(skills.get(i))
                                .priority(i + 1)
                                .build())
                        .toList());
            }
        }

        // 8. 이미지 반영 (projectMedias를 보낸 경우만)
        if (medias != null) {
            Map<Long, ProjectMedia> currentMediaById = currentMedias.stream()
                    .collect(Collectors.toMap(ProjectMedia::getId, Function.identity()));
            Set<Long> keptMediaIds = medias.stream()
                    .map(UpdateProjectMediaItem::projectMediaId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // 8-1. 최종 목록에서 빠진 기존 이미지 삭제
            //      -> S3 파일 삭제 예약 (FileUtil.delete, 커밋 후 삭제)
            //      -> DB 행 hard delete (관리자가 직접 뺀 이미지라 복구 불필요)
            List<ProjectMedia> removedMedias = currentMedias.stream()
                    .filter(media -> !keptMediaIds.contains(media.getId()))
                    .toList();
            if (!removedMedias.isEmpty()) {
                removedMedias.forEach(media -> fileUtil.delete(media.getS3Key()));
                projectMediaRepository.deleteAllInBatch(removedMedias);
            }

            // 8-2. 남은 기존 이미지의 대표 여부를 모두 false로 바꾼 뒤 flush
            //      -> 대표 이미지 부분 유니크 인덱스(프로젝트당 1개) 위반 방지
            //      -> Hibernate는 INSERT를 UPDATE보다 먼저 실행하므로, 새 대표 이미지 저장 전에 기존 대표를 먼저 해제
            keptMediaIds.forEach(id -> {
                ProjectMedia media = currentMediaById.get(id);
                media.update(media.getCaption(), false, media.getPriority());
            });
            projectMediaRepository.flush();

            // 8-3. 최종 목록 순서대로 반영 (priority 1부터)
            //      -> 기존 이미지 : 캡션, 대표 여부, 순서 수정 (ProjectMedia.update)
            //      -> 새 이미지 : fileIndex의 파일 업로드 (StorageFolder.PROJECT) 후 저장
            //      -> 캡션 null은 설명 없음, 대표 여부 null은 false
            List<ProjectMedia> newMedias = new ArrayList<>();
            for (int i = 0; i < medias.size(); i++) {
                UpdateProjectMediaItem media = medias.get(i);
                boolean important = Boolean.TRUE.equals(media.projectMediaIsImportant());
                if (media.projectMediaId() != null) {
                    currentMediaById.get(media.projectMediaId()).update(media.projectMediaCaption(), important, i + 1);
                    continue;
                }
                UploadedFile image = fileUtil.upload(mediaFiles.get(media.fileIndex()), StorageFolder.PROJECT);
                newMedias.add(ProjectMedia.builder()
                        .project(project)
                        .originalName(image.originalName())
                        .s3Key(image.s3Key())
                        .size(image.size())
                        .ext(image.ext())
                        .caption(media.projectMediaCaption())
                        .important(important)
                        .priority(i + 1)
                        .build());
            }
            projectMediaRepository.saveAll(newMedias);
        }

        // 9. 수정 로그 기록 (projectId)
        log.info("프로젝트 수정 - projectId = {}", project.getId());

        // 10. 응답 DTO로 변환
        return UpdateProjectResponseDto.fromEntity(project);
    }

    // 수정시 최종 이미지 정보 검증
    //      exc. 파일 10개 초과 (FILE_COUNT_EXCEED)
    //      exc. projectMediaId, fileIndex 중 하나만 있지 않은 항목 / 이 프로젝트의 이미지가 아니거나 중복된 projectMediaId
    //           / fileIndex 항목 수와 파일 수 불일치, 범위 밖 또는 중복 fileIndex (PROJECT_MEDIA_INVALID)
    //      exc. 대표 이미지 2개 이상 (PROJECT_MEDIA_IMPORTANT_DUPLICATED)
    private void validateUpdateProjectMedias(List<MultipartFile> files, List<UpdateProjectMediaItem> medias, List<ProjectMedia> currentMedias) {
        if (files.size() > MAX_PROJECT_MEDIA_COUNT) {
            throw new CustomException(ExceptionCode.FILE_COUNT_EXCEED);
        }
        Set<Long> currentMediaIds = currentMedias.stream().map(ProjectMedia::getId).collect(Collectors.toSet());
        Set<Long> mediaIds = new HashSet<>();
        Set<Integer> fileIndexes = new HashSet<>();
        for (UpdateProjectMediaItem media : medias) {
            boolean hasMediaId = media.projectMediaId() != null;
            if (hasMediaId == (media.fileIndex() != null)) {
                throw new CustomException(ExceptionCode.PROJECT_MEDIA_INVALID);
            }
            boolean valid = hasMediaId
                    ? currentMediaIds.contains(media.projectMediaId()) && mediaIds.add(media.projectMediaId())
                    : media.fileIndex() < files.size() && fileIndexes.add(media.fileIndex());
            if (!valid) {
                throw new CustomException(ExceptionCode.PROJECT_MEDIA_INVALID);
            }
        }
        if (fileIndexes.size() != files.size()) {
            throw new CustomException(ExceptionCode.PROJECT_MEDIA_INVALID);
        }
        if (medias.stream().filter(media -> Boolean.TRUE.equals(media.projectMediaIsImportant())).count() > 1) {
            throw new CustomException(ExceptionCode.PROJECT_MEDIA_IMPORTANT_DUPLICATED);
        }
    }

    // 날짜 문자열 변환 (YYYY-MM-DD 형식은 DTO에서 검증)
    //      exc. 존재하지 않는 날짜면 에러 처리 (VALID_ERROR)
    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new CustomException(ExceptionCode.VALID_ERROR);
        }
    }

    // 빈 문자열이면 null (수정시 값 지움)
    private String emptyToNull(String value) {
        return value.isEmpty() ? null : value;
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

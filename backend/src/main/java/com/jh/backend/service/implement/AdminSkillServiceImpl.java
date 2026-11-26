package com.jh.backend.service.implement;

import com.jh.backend.common.CacheNames;
import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.skill.item.DeleteSkillItem;
import com.jh.backend.dto.skill.item.FindAllSkillsItem;
import com.jh.backend.dto.skill.request.CreateSkillRequestDto;
import com.jh.backend.dto.skill.request.FindAllSkillsRequestDto;
import com.jh.backend.dto.skill.request.UpdateSkillRequestDto;
import com.jh.backend.dto.skill.response.CreateSkillResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillCategoriesResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillsResponseDto;
import com.jh.backend.dto.skill.response.UpdateSkillResponseDto;
import com.jh.backend.entity.Skill;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminSkillRepository;
import com.jh.backend.repository.PostSkillRepository;
import com.jh.backend.repository.ProjectSkillRepository;
import com.jh.backend.repository.SkillRepository;
import com.jh.backend.service.AdminSkillService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.file.UploadedFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSkillServiceImpl implements AdminSkillService {

    private final SkillRepository skillRepository;
    private final PostSkillRepository postSkillRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final AdminSkillRepository adminSkillRepository;
    private final FileUtil fileUtil;

    // 기술 스택 추가
    @Override
    @Transactional
    public CreateSkillResponseDto createSkill(CreateSkillRequestDto dto, MultipartFile file) {

        // 1. 이름, 카테고리 앞뒤 공백 제거
        String name = dto.skillName().strip();
        String category = dto.skillCategory().strip();

        // 2. 이름 중복 확인 (대소문자 무시)
        //      exc. 이미 등록된 이름이면 에러 처리 (SKILL_NAME_DUPLICATED)
        //      -> 중복 확인을 업로드보다 먼저 하여 불필요한 S3 업로드 방지
        if (skillRepository.existsByNameIgnoreCase(name)) {
            throw new CustomException(ExceptionCode.SKILL_NAME_DUPLICATED);
        }

        // 3. 아이콘 업로드 (StorageFolder.SKILL)
        //      exc. 파일 미존재, 용량 초과, 허용하지 않는 형식이면 에러 처리 (FileUtil에서 검증)
        //      -> 이후 DB 저장 실패로 롤백되면 업로드한 파일은 S3에서 삭제
        UploadedFile icon = fileUtil.upload(file, StorageFolder.SKILL);

        // 4. 기술 스택 저장
        //      -> 동시 요청으로 같은 이름이 저장되면 DB 고유 인덱스에서 에러 처리 (DATA_INTEGRITY_VIOLATION)
        //      -> 추가 로그 기록 (skillId)
        Skill skill = skillRepository.save(Skill.builder()
                .name(name)
                .category(category)
                .originalName(icon.originalName())
                .s3Key(icon.s3Key())
                .size(icon.size())
                .ext(icon.ext())
                .build());
        log.info("기술 스택 추가 - skillId = {}", skill.getId());

        // 5. 응답 DTO로 변환
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        return CreateSkillResponseDto.fromEntity(skill, fileUtil.toUrl(skill.getS3Key()));
    }

    // 기술 스택 목록 조회
    @Override
    @Transactional(readOnly = true)
    public FindAllSkillsResponseDto findAllSkills(FindAllSkillsRequestDto dto) {

        // 1. 검색 조건 정리
        //      -> 카테고리, 검색어의 앞뒤 공백 제거
        //      -> 빈 값이면 조건 없음(null)으로 처리
        //      -> 검색어의 %, _, \ 는 글자 그대로 검색되도록 escape 처리
        String category = StringUtils.hasText(dto.skillCategory()) ? dto.skillCategory().strip() : null;
        String namePattern = StringUtils.hasText(dto.keyword())
                ? "%" + escapeLike(dto.keyword().strip().toLowerCase(Locale.ROOT)) + "%"
                : null;

        // 2. 기술 스택 목록 조회
        //      -> 카테고리 : 정확히 일치
        //      -> 검색어 : 이름 부분 일치 (대소문자 무시)
        //      -> 등록일 내림차순, 같으면 PK 내림차순 (페이징 없음)
        List<Skill> skills = skillRepository.findAllBySearch(category, namePattern);

        // 3. 응답 DTO로 변환
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        //      -> totalCount는 조회된 목록 개수
        return FindAllSkillsResponseDto.from(skills.stream()
                .map(skill -> FindAllSkillsItem.fromEntity(skill, fileUtil.toUrl(skill.getS3Key())))
                .toList());
    }

    // 기술 스택 카테고리 목록 조회
    @Override
    @Transactional(readOnly = true)
    public FindAllSkillCategoriesResponseDto findAllSkillCategories() {

        // 1. 카테고리 목록 조회 (중복 제거)
        //      -> 삭제된 기술 스택의 카테고리는 제외 (@SQLRestriction)
        //      -> 대소문자만 다른 카테고리는 각각 표시 (목록 조회의 카테고리 필터와 같은 기준)
        List<String> categories = skillRepository.findAllCategories();

        // 2. 알파벳 오름차순 정렬 (대소문자 무시)
        //      -> DB collation과 관계없이 같은 순서가 되도록 Java에서 정렬
        //      -> 대소문자만 다른 값은 원래 문자열 순서로 정렬
        List<String> sorted = categories.stream()
                .sorted(String.CASE_INSENSITIVE_ORDER.thenComparing(Comparator.naturalOrder()))
                .toList();

        // 3. 응답 DTO로 변환
        return new FindAllSkillCategoriesResponseDto(sorted);
    }

    // 기술 스택 수정
    //      -> PATCH 방식 (보낸 값만 수정, data 파트 또는 필드가 null이면 기존 값 유지)
    //      -> 프로필의 핵심 기술 스택에 표시되므로 커밋 후 프로필 캐시 삭제
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheNames.PROFILE, allEntries = true)
    public UpdateSkillResponseDto updateSkill(Long skillId, UpdateSkillRequestDto dto, MultipartFile file) {

        // 1. 기술 스택 존재 여부 확인
        //      exc. 기술 스택 미존재시 에러 처리 (SKILL_NOT_FOUND)
        Skill skill = skillRepository.findById(skillId).orElseThrow(
                () -> new CustomException(ExceptionCode.SKILL_NOT_FOUND));

        // 2. 수정할 값 결정
        //      -> 앞뒤 공백은 DTO에서 검증 전에 제거 (공백만 보내면 DTO 검증에서 400)
        //      -> data 파트가 없으면 이름, 카테고리 모두 기존 값 유지
        //      -> 이름, 카테고리 : null이면 기존 값 유지
        //      -> 카테고리는 입력값 그대로 저장 (기존 카테고리 표기로 맞추지 않음)
        String requestName = dto != null ? dto.skillName() : null;
        String requestCategory = dto != null ? dto.skillCategory() : null;
        String name = requestName != null ? requestName : skill.getName();
        String category = requestCategory != null ? requestCategory : skill.getCategory();

        // 3. 이름 중복 확인 (이름을 보낸 경우에만, 자기 자신 제외, 대소문자 무시)
        //      exc. 다른 기술 스택과 이름 중복시 에러 처리 (SKILL_NAME_DUPLICATED)
        //      -> 자기 이름의 대소문자만 바꾸는 것은 허용
        //      -> 중복 확인을 업로드보다 먼저 하여 불필요한 S3 업로드 방지
        if (requestName != null && skillRepository.existsByNameIgnoreCaseAndIdNot(name, skillId)) {
            throw new CustomException(ExceptionCode.SKILL_NAME_DUPLICATED);
        }

        // 4. 아이콘 교체
        //      -> 파일이 없거나 빈 파일이면 기존 아이콘 유지
        //      exc. 용량 초과, 허용하지 않는 형식이면 에러 처리 (FileUtil에서 검증)
        //      -> 새 파일은 롤백되면 S3에서 삭제
        //      -> 기존 파일은 커밋 이후 S3에서 삭제
        if (file != null && !file.isEmpty()) {
            String oldS3Key = skill.getS3Key();
            UploadedFile icon = fileUtil.upload(file, StorageFolder.SKILL);
            skill.updateIcon(icon.originalName(), icon.s3Key(), icon.size(), icon.ext());
            fileUtil.delete(oldS3Key);
        }

        // 5. 이름, 카테고리 수정 (변경 감지)
        //      -> 값이 같으면 UPDATE 미실행
        //      -> 수정 로그 기록 (skillId)
        skill.update(name, category);
        log.info("기술 스택 수정 - skillId = {}", skillId);

        // 6. 응답 DTO로 변환
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        return UpdateSkillResponseDto.fromEntity(skill, fileUtil.toUrl(skill.getS3Key()));
    }

    // 기술 스택 삭제
    @Override
    @Transactional
    public void deleteSkill(Long skillId) {

        // 1. 기술 스택 존재 여부 확인
        //      exc. 기술 스택 미존재 또는 이미 삭제된 경우 에러 처리 (SKILL_NOT_FOUND)
        Skill skill = skillRepository.findById(skillId).orElseThrow(
                () -> new CustomException(ExceptionCode.SKILL_NOT_FOUND));

        // 2. 사용 여부 확인
        //      -> 게시글 수, 프로젝트 수 : 삭제되지 않은 게시글, 프로젝트의 연결만 셈
        //      -> 프로필 사용 여부 : 관리자 기술 스택 연결 존재 여부
        //      exc. 하나라도 사용 중이면 에러 처리 (SKILL_IN_USE, data에 postCount, projectCount, profileUsed 포함)
        DeleteSkillItem usage = new DeleteSkillItem(
                postSkillRepository.countBySkillId(skillId),
                projectSkillRepository.countBySkillId(skillId),
                adminSkillRepository.existsBySkillId(skillId));
        if (usage.isInUse()) {
            throw new CustomException(ExceptionCode.SKILL_IN_USE, usage);
        }

        // 3. soft delete (deleted_at 기록)
        //      -> S3 아이콘 파일은 삭제하지 않음
        //      -> 삭제 로그 기록 (skillId)
        skill.delete();
        log.info("기술 스택 삭제 - skillId = {}", skillId);
    }

    // LIKE 검색의 특수문자(\, %, _)를 글자 그대로 검색되도록 escape
    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}

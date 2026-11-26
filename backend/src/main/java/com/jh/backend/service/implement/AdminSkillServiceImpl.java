package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.skill.item.FindAllSkillsItem;
import com.jh.backend.dto.skill.request.CreateSkillRequestDto;
import com.jh.backend.dto.skill.request.FindAllSkillsRequestDto;
import com.jh.backend.dto.skill.response.CreateSkillResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillCategoriesResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillsResponseDto;
import com.jh.backend.entity.Skill;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.SkillRepository;
import com.jh.backend.service.AdminSkillService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.file.UploadedFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // LIKE 검색의 특수문자(\, %, _)를 글자 그대로 검색되도록 escape
    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}

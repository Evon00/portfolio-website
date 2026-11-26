package com.jh.backend.service.implement;

import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.skill.request.CreateSkillRequestDto;
import com.jh.backend.dto.skill.response.CreateSkillResponseDto;
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
import org.springframework.web.multipart.MultipartFile;

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
}

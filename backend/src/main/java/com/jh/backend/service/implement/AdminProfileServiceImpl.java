package com.jh.backend.service.implement;

import com.jh.backend.common.CacheNames;
import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.profile.item.FindProfileItem;
import com.jh.backend.dto.profile.item.UpdateProfileSkillsErrorItem;
import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.request.UpdateProfileSkillsRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;
import com.jh.backend.dto.profile.response.UpdateProfileSkillsResponseDto;
import com.jh.backend.dto.profile.response.UploadProfileImageResponseDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.entity.AdminSkill;
import com.jh.backend.entity.Skill;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
import com.jh.backend.repository.AdminSkillRepository;
import com.jh.backend.repository.SkillRepository;
import com.jh.backend.service.AdminProfileService;
import com.jh.backend.util.file.FileUtil;
import com.jh.backend.util.file.UploadedFile;
import com.jh.backend.util.login.LoginChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProfileServiceImpl implements AdminProfileService {

    private final AdminRepository adminRepository;
    private final AdminSkillRepository adminSkillRepository;
    private final SkillRepository skillRepository;
    private final LoginChecker loginChecker;
    private final FileUtil fileUtil;

    // 프로필 수정
    //      -> PATCH 방식 (보낸 필드만 수정, null이면 기존 값 유지)
    //      -> 커밋 후 프로필 캐시 삭제 (@CacheEvict, PROFILE)
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheNames.PROFILE, allEntries = true)
    public UpdateProfileResponseDto updateProfile(UpdateProfileRequestDto dto) {

        // 1. 로그인한 관리자 조회
        //      -> 토큰의 관리자 PK 사용 (LoginChecker)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        Long adminId = loginChecker.getAdminId();
        Admin admin = adminRepository.findById(adminId).orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 수정할 값 결정
        //      -> 앞뒤 공백은 DTO에서 검증 전에 제거
        //      -> 이름, 소개 : null이면 기존 값 유지 (공백만 보내면 DTO 검증에서 400)
        //      -> GitHub 주소, 이메일 : null이면 기존 값 유지, ""이면 null로 저장 (값 비우기)
        String name = dto.adminName() != null ? dto.adminName() : admin.getName();
        String description = dto.adminDescription() != null ? dto.adminDescription() : admin.getDescription();
        String githubUrl = dto.adminGithubUrl() != null ? emptyToNull(dto.adminGithubUrl()) : admin.getGithubUrl();
        String email = dto.adminEmail() != null ? emptyToNull(dto.adminEmail()) : admin.getEmail();

        // 3. 프로필 수정 (Admin.updateProfile)
        //      -> 값이 같으면 dirty checking으로 UPDATE 미실행
        //      -> 수정 로그 기록 (adminId)
        admin.updateProfile(name, description, githubUrl, email);
        log.info("프로필 수정 - adminId = {}", adminId);

        // 4. 응답 DTO로 변환
        //      -> 프로필 이미지는 s3 key를 공개 주소로 변환 (없으면 null)
        return UpdateProfileResponseDto.fromEntity(admin, fileUtil.toUrl(admin.getProfileS3Key()));
    }

    // 프로필 이미지 업로드
    //      -> 기존 이미지가 있으면 교체 (기존 파일은 커밋 후 S3에서 삭제)
    //      -> 커밋 후 프로필 캐시 삭제 (@CacheEvict, PROFILE)
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheNames.PROFILE, allEntries = true)
    public UploadProfileImageResponseDto uploadProfileImage(MultipartFile file) {

        // 1. 로그인한 관리자 조회
        //      -> 토큰의 관리자 PK 사용 (LoginChecker)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        //      -> 관리자 확인을 업로드보다 먼저 하여 불필요한 S3 업로드 방지
        Long adminId = loginChecker.getAdminId();
        Admin admin = adminRepository.findById(adminId).orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 이미지 업로드 (StorageFolder.PROFILE)
        //      exc. 빈 파일, 용량 초과, 허용하지 않는 형식(JPG, PNG, GIF, WEBP 외)이면 에러 처리 (FileUtil에서 검증)
        //      -> 이후 DB 저장 실패로 롤백되면 업로드한 파일은 S3에서 삭제
        UploadedFile image = fileUtil.upload(file, StorageFolder.PROFILE);

        // 3. 프로필 이미지 교체 (Admin.updateProfileImage)
        //      -> s3 key, 크기, 확장자 저장
        //      -> 기존 s3 key는 커밋 후 S3에서 삭제 (기존 이미지가 없으면 건너뜀)
        //      -> 업로드 로그 기록 (adminId)
        String oldS3Key = admin.getProfileS3Key();
        admin.updateProfileImage(image.s3Key(), image.size(), image.ext());
        fileUtil.delete(oldS3Key);
        log.info("프로필 이미지 업로드 - adminId = {}", adminId);

        // 4. 응답 DTO로 변환
        //      -> s3 key를 공개 주소로 변환
        return new UploadProfileImageResponseDto(fileUtil.toUrl(admin.getProfileS3Key()));
    }

    // 프로필 이미지 삭제
    //      -> 등록된 이미지가 없어도 성공 처리 (멱등)
    //      -> 커밋 후 프로필 캐시 삭제 (@CacheEvict, PROFILE)
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheNames.PROFILE, allEntries = true)
    public void deleteProfileImage() {

        // 1. 로그인한 관리자 조회
        //      -> 토큰의 관리자 PK 사용 (LoginChecker)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        Long adminId = loginChecker.getAdminId();
        Admin admin = adminRepository.findById(adminId).orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 등록된 이미지가 없으면 종료
        //      -> 변경할 값이 없으므로 UPDATE, S3 삭제 없이 성공 응답
        String oldS3Key = admin.getProfileS3Key();
        if (oldS3Key == null) {
            return;
        }

        // 3. 프로필 이미지 제거 (Admin.deleteProfileImage)
        //      -> s3 key, 크기, 확장자를 null로 변경
        //      -> 기존 s3 key는 커밋 후 S3에서 삭제
        //      -> 삭제 로그 기록 (adminId)
        admin.deleteProfileImage();
        fileUtil.delete(oldS3Key);
        log.info("프로필 이미지 삭제 - adminId = {}", adminId);
    }

    // 핵심 기술 스택 수정 (전체 교체)
    //      -> 기존 핵심 기술 스택을 모두 지우고 요청 배열 순서대로 다시 저장
    //      -> 커밋 후 프로필 캐시 삭제 (@CacheEvict, PROFILE)
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheNames.PROFILE, allEntries = true)
    public UpdateProfileSkillsResponseDto updateProfileSkills(UpdateProfileSkillsRequestDto dto) {

        // 1. 로그인한 관리자 조회
        //      -> 토큰의 관리자 PK 사용 (LoginChecker)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        Long adminId = loginChecker.getAdminId();
        Admin admin = adminRepository.findById(adminId).orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 중복 ID 확인
        //      exc. 같은 기술 스택 ID가 2번 이상 있으면 에러 처리 (SKILL_ID_DUPLICATED, 400)
        List<Long> skillIds = dto.skillIds();
        if (new HashSet<>(skillIds).size() != skillIds.size()) {
            throw new CustomException(ExceptionCode.SKILL_ID_DUPLICATED);
        }

        // 3. 기술 스택 조회 (findAllById, 쿼리 1번)
        //      -> 삭제된 기술 스택은 조회되지 않음 (@SQLRestriction)
        //      exc. 조회되지 않은 ID가 있으면 에러 처리 (SKILL_ID_INVALID, 400, data에 없는 ID 목록)
        Map<Long, Skill> skillMap = skillRepository.findAllById(skillIds).stream()
                .collect(Collectors.toMap(Skill::getId, Function.identity()));
        List<Long> invalidIds = skillIds.stream().filter(id -> !skillMap.containsKey(id)).toList();
        if (!invalidIds.isEmpty()) {
            throw new CustomException(ExceptionCode.SKILL_ID_INVALID, new UpdateProfileSkillsErrorItem(invalidIds));
        }

        // 4. 기존 핵심 기술 스택 일괄 삭제 (@Modifying JPQL)
        //      -> 바로 실행되어 같은 기술 스택을 다시 저장해도 UNIQUE(admin_id, skill_id) 위반 없음
        //      -> 빈 배열이면 삭제만 하고 저장할 항목 없음 (핵심 기술 스택 비우기)
        adminSkillRepository.deleteAllByAdminId(adminId);

        // 5. 요청 배열 순서대로 저장 (saveAll)
        //      -> priority는 1부터 순서대로
        //      -> 수정 로그 기록 (adminId, 기술 스택 수)
        List<AdminSkill> adminSkills = adminSkillRepository.saveAll(IntStream.range(0, skillIds.size())
                .mapToObj(i -> AdminSkill.builder()
                        .admin(admin)
                        .skill(skillMap.get(skillIds.get(i)))
                        .priority(i + 1)
                        .build())
                .toList());
        log.info("핵심 기술 스택 수정 - adminId = {}, skillCount = {}", adminId, adminSkills.size());

        // 6. 응답 DTO로 변환
        //      -> 저장한 순서(priority 오름차순)로 변환, 다시 조회하지 않음
        //      -> skillUrl은 s3 key를 공개 주소로 변환
        return new UpdateProfileSkillsResponseDto(adminSkills.stream()
                .map(adminSkill -> FindProfileItem.fromEntity(adminSkill, fileUtil.toUrl(adminSkill.getSkill().getS3Key())))
                .toList());
    }

    // 빈 문자열이면 null
    private String emptyToNull(String value) {
        return value.isEmpty() ? null : value;
    }
}

package com.jh.backend.service.implement;

import com.jh.backend.common.CacheNames;
import com.jh.backend.common.enums.StorageFolder;
import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;
import com.jh.backend.dto.profile.response.UploadProfileImageResponseDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProfileServiceImpl implements AdminProfileService {

    private final AdminRepository adminRepository;
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

    // 빈 문자열이면 null
    private String emptyToNull(String value) {
        return value.isEmpty() ? null : value;
    }
}

package com.jh.backend.service;

import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.request.UpdateProfileSkillsRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;
import com.jh.backend.dto.profile.response.UpdateProfileSkillsResponseDto;
import com.jh.backend.dto.profile.response.UploadProfileImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AdminProfileService {

    // 프로필 수정
    UpdateProfileResponseDto updateProfile(UpdateProfileRequestDto dto);

    // 프로필 이미지 업로드
    UploadProfileImageResponseDto uploadProfileImage(MultipartFile file);

    // 프로필 이미지 삭제
    void deleteProfileImage();

    // 핵심 기술 스택 수정 (전체 교체)
    UpdateProfileSkillsResponseDto updateProfileSkills(UpdateProfileSkillsRequestDto dto);
}

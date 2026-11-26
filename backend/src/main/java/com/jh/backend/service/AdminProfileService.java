package com.jh.backend.service;

import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;
import com.jh.backend.dto.profile.response.UploadProfileImageResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AdminProfileService {

    // 프로필 수정
    UpdateProfileResponseDto updateProfile(UpdateProfileRequestDto dto);

    // 프로필 이미지 업로드
    UploadProfileImageResponseDto uploadProfileImage(MultipartFile file);

    // 프로필 이미지 삭제
    void deleteProfileImage();
}

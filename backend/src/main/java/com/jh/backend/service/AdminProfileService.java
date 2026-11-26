package com.jh.backend.service;

import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;

public interface AdminProfileService {

    // 프로필 수정
    UpdateProfileResponseDto updateProfile(UpdateProfileRequestDto dto);
}

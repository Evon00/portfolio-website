package com.jh.backend.service;

import com.jh.backend.dto.profile.response.FindProfileResponseDto;

public interface ProfileService {

    // 프로필 조회
    FindProfileResponseDto findProfile();
}

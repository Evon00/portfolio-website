package com.jh.backend.service;

import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;

public interface AdminProjectService {

    // 프로젝트 슬러그 중복 확인
    CheckProjectSlugResponseDto checkProjectSlug(CheckProjectSlugRequestDto dto);
}

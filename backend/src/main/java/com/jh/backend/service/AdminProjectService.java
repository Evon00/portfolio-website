package com.jh.backend.service;

import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.request.CreateProjectRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.dto.project.response.CreateProjectResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminProjectService {

    // 프로젝트 슬러그 중복 확인
    CheckProjectSlugResponseDto checkProjectSlug(CheckProjectSlugRequestDto dto);

    // 프로젝트 추가
    CreateProjectResponseDto createProject(CreateProjectRequestDto dto, List<MultipartFile> files);
}

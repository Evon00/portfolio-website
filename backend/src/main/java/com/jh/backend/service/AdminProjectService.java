package com.jh.backend.service;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.project.item.FindAllAdminProjectsItem;
import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.request.CreateProjectRequestDto;
import com.jh.backend.dto.project.request.FindAllAdminProjectsRequestDto;
import com.jh.backend.dto.project.request.UpdateProjectPriorityRequestDto;
import com.jh.backend.dto.project.request.UpdateProjectRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.dto.project.response.CreateProjectResponseDto;
import com.jh.backend.dto.project.response.FindProjectResponseDto;
import com.jh.backend.dto.project.response.UpdateProjectPriorityResponseDto;
import com.jh.backend.dto.project.response.UpdateProjectResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminProjectService {

    // 프로젝트 슬러그 중복 확인
    CheckProjectSlugResponseDto checkProjectSlug(CheckProjectSlugRequestDto dto);

    // 프로젝트 추가
    CreateProjectResponseDto createProject(CreateProjectRequestDto dto, List<MultipartFile> files);

    // 관리자 프로젝트 목록 조회
    PageResponseDto<FindAllAdminProjectsItem> findAllAdminProjects(FindAllAdminProjectsRequestDto dto);

    // 프로젝트 상세 조회 (수정용)
    FindProjectResponseDto findProject(Long projectId);

    // 프로젝트 수정
    UpdateProjectResponseDto updateProject(Long projectId, UpdateProjectRequestDto dto, List<MultipartFile> files);

    // 프로젝트 순서 변경
    UpdateProjectPriorityResponseDto updateProjectPriority(Long projectId, UpdateProjectPriorityRequestDto dto);
}

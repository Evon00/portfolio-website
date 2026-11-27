package com.jh.backend.service;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.project.item.FindAllProjectsItem;
import com.jh.backend.dto.project.request.FindAllProjectsRequestDto;
import com.jh.backend.dto.project.response.FindProjectBySlugResponseDto;

public interface ProjectService {

    // 공개 프로젝트 목록 조회
    PageResponseDto<FindAllProjectsItem> findAllProjects(FindAllProjectsRequestDto dto);

    // 프로젝트 상세 조회 (슬러그)
    FindProjectBySlugResponseDto findProjectBySlug(String projectSlug);
}

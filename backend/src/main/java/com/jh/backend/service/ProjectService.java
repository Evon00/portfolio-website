package com.jh.backend.service;

import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.project.item.FindAllProjectsItem;
import com.jh.backend.dto.project.request.FindAllProjectsRequestDto;

public interface ProjectService {

    // 공개 프로젝트 목록 조회
    PageResponseDto<FindAllProjectsItem> findAllProjects(FindAllProjectsRequestDto dto);
}

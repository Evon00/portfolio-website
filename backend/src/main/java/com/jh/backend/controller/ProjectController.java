package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.project.item.FindAllProjectsItem;
import com.jh.backend.dto.project.request.FindAllProjectsRequestDto;
import com.jh.backend.service.ProjectService;
import com.jh.backend.swagger.project.FindAllProjectsSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "프로젝트", description = "공개 프로젝트 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // 공개 프로젝트 목록 조회
    @FindAllProjectsSwaggerDocs
    @GetMapping
    public ResponseEntity<CommonApiResponse<PageResponseDto<FindAllProjectsItem>>> findAllProjects(
            @Valid @ParameterObject FindAllProjectsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(projectService.findAllProjects(dto)));
    }
}

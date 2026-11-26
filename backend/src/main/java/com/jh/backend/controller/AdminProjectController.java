package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.common.PageResponseDto;
import com.jh.backend.dto.project.item.FindAllAdminProjectsItem;
import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.request.CreateProjectRequestDto;
import com.jh.backend.dto.project.request.FindAllAdminProjectsRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.dto.project.response.CreateProjectResponseDto;
import com.jh.backend.service.AdminProjectService;
import com.jh.backend.swagger.project.CheckProjectSlugSwaggerDocs;
import com.jh.backend.swagger.project.CreateProjectSwaggerDocs;
import com.jh.backend.swagger.project.FindAllAdminProjectsSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "관리자 프로젝트", description = "관리자용 프로젝트 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/admin/project")
@RequiredArgsConstructor
public class AdminProjectController {

    private final AdminProjectService adminProjectService;

    // 프로젝트 슬러그 중복 확인
    @CheckProjectSlugSwaggerDocs
    @GetMapping("/slug/check")
    public ResponseEntity<CommonApiResponse<CheckProjectSlugResponseDto>> checkProjectSlug(
            @Valid @ParameterObject CheckProjectSlugRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProjectService.checkProjectSlug(dto)));
    }

    // 프로젝트 추가
    @CreateProjectSwaggerDocs
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<CreateProjectResponseDto>> createProject(
            @Valid @RequestPart CreateProjectRequestDto data,
            @RequestPart(required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProjectService.createProject(data, files)));
    }

    // 관리자 프로젝트 목록 조회
    @FindAllAdminProjectsSwaggerDocs
    @GetMapping
    public ResponseEntity<CommonApiResponse<PageResponseDto<FindAllAdminProjectsItem>>> findAllAdminProjects(
            @Valid @ParameterObject FindAllAdminProjectsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProjectService.findAllAdminProjects(dto)));
    }
}

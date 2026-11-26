package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
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
import com.jh.backend.service.AdminProjectService;
import com.jh.backend.swagger.project.CheckProjectSlugSwaggerDocs;
import com.jh.backend.swagger.project.CreateProjectSwaggerDocs;
import com.jh.backend.swagger.project.FindAllAdminProjectsSwaggerDocs;
import com.jh.backend.swagger.project.FindProjectSwaggerDocs;
import com.jh.backend.swagger.project.UpdateProjectPrioritySwaggerDocs;
import com.jh.backend.swagger.project.UpdateProjectSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    // 프로젝트 상세 조회 (수정용)
    @FindProjectSwaggerDocs
    @GetMapping("/{projectId}")
    public ResponseEntity<CommonApiResponse<FindProjectResponseDto>> findProject(
            @Positive(message = "프로젝트 PK는 0보다 큰 양수여야 합니다.")
            @PathVariable Long projectId) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProjectService.findProject(projectId)));
    }

    // 프로젝트 수정
    @UpdateProjectSwaggerDocs
    @PatchMapping(value = "/{projectId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<UpdateProjectResponseDto>> updateProject(
            @Positive(message = "프로젝트 PK는 0보다 큰 양수여야 합니다.")
            @PathVariable Long projectId,
            @Valid @RequestPart UpdateProjectRequestDto data,
            @RequestPart(required = false) List<MultipartFile> files) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProjectService.updateProject(projectId, data, files)));
    }

    // 프로젝트 순서 변경
    @UpdateProjectPrioritySwaggerDocs
    @PatchMapping("/{projectId}/priority")
    public ResponseEntity<CommonApiResponse<UpdateProjectPriorityResponseDto>> updateProjectPriority(
            @Positive(message = "프로젝트 PK는 0보다 큰 양수여야 합니다.")
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectPriorityRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProjectService.updateProjectPriority(projectId, dto)));
    }
}

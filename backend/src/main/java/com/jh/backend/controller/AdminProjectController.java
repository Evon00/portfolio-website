package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.service.AdminProjectService;
import com.jh.backend.swagger.project.CheckProjectSlugSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}

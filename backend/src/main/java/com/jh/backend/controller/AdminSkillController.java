package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.skill.request.CreateSkillRequestDto;
import com.jh.backend.dto.skill.response.CreateSkillResponseDto;
import com.jh.backend.service.AdminSkillService;
import com.jh.backend.swagger.skill.CreateSkillSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "관리자 기술 스택", description = "관리자용 기술 스택 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/admin/skill")
@RequiredArgsConstructor
public class AdminSkillController {

    private final AdminSkillService adminSkillService;

    // 기술 스택 추가
    @CreateSkillSwaggerDocs
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<CreateSkillResponseDto>> createSkill(
            @Valid @RequestPart CreateSkillRequestDto data,
            @RequestPart MultipartFile file) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminSkillService.createSkill(data, file)));
    }
}

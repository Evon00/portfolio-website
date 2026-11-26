package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.skill.request.CreateSkillRequestDto;
import com.jh.backend.dto.skill.request.FindAllSkillsRequestDto;
import com.jh.backend.dto.skill.request.UpdateSkillRequestDto;
import com.jh.backend.dto.skill.response.CreateSkillResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillCategoriesResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillsResponseDto;
import com.jh.backend.dto.skill.response.UpdateSkillResponseDto;
import com.jh.backend.service.AdminSkillService;
import com.jh.backend.swagger.skill.CreateSkillSwaggerDocs;
import com.jh.backend.swagger.skill.FindAllSkillCategoriesSwaggerDocs;
import com.jh.backend.swagger.skill.FindAllSkillsSwaggerDocs;
import com.jh.backend.swagger.skill.UpdateSkillSwaggerDocs;
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

    // 기술 스택 목록 조회
    @FindAllSkillsSwaggerDocs
    @GetMapping
    public ResponseEntity<CommonApiResponse<FindAllSkillsResponseDto>> findAllSkills(
            @Valid @ParameterObject FindAllSkillsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminSkillService.findAllSkills(dto)));
    }

    // 기술 스택 카테고리 목록 조회
    @FindAllSkillCategoriesSwaggerDocs
    @GetMapping("/category")
    public ResponseEntity<CommonApiResponse<FindAllSkillCategoriesResponseDto>> findAllSkillCategories() {
        return ResponseEntity.ok(CommonApiResponse.ok(adminSkillService.findAllSkillCategories()));
    }

    // 기술 스택 수정
    @UpdateSkillSwaggerDocs
    @PatchMapping(value = "/{skillId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<UpdateSkillResponseDto>> updateSkill(
            @Positive(message = "기술 스택 PK는 0보다 큰 양수여야 합니다.")
            @PathVariable Long skillId,
            @Valid @RequestPart UpdateSkillRequestDto data,
            @RequestPart(required = false) MultipartFile file) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminSkillService.updateSkill(skillId, data, file)));
    }
}

package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.request.UpdateProfileSkillsRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;
import com.jh.backend.dto.profile.response.UpdateProfileSkillsResponseDto;
import com.jh.backend.dto.profile.response.UploadProfileImageResponseDto;
import com.jh.backend.service.AdminProfileService;
import com.jh.backend.swagger.profile.DeleteProfileImageSwaggerDocs;
import com.jh.backend.swagger.profile.UpdateProfileSkillsSwaggerDocs;
import com.jh.backend.swagger.profile.UpdateProfileSwaggerDocs;
import com.jh.backend.swagger.profile.UploadProfileImageSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "관리자 프로필", description = "관리자용 프로필 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
public class AdminProfileController {

    private final AdminProfileService adminProfileService;

    // 프로필 수정
    @UpdateProfileSwaggerDocs
    @PatchMapping
    public ResponseEntity<CommonApiResponse<UpdateProfileResponseDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProfileService.updateProfile(dto)));
    }

    // 프로필 이미지 업로드
    @UploadProfileImageSwaggerDocs
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonApiResponse<UploadProfileImageResponseDto>> uploadProfileImage(
            @RequestPart MultipartFile file) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProfileService.uploadProfileImage(file)));
    }

    // 프로필 이미지 삭제
    @DeleteProfileImageSwaggerDocs
    @DeleteMapping("/image")
    public ResponseEntity<CommonApiResponse<Void>> deleteProfileImage() {
        adminProfileService.deleteProfileImage();
        return ResponseEntity.ok(CommonApiResponse.ok());
    }

    // 핵심 기술 스택 수정 (전체 교체)
    @UpdateProfileSkillsSwaggerDocs
    @PutMapping("/skill")
    public ResponseEntity<CommonApiResponse<UpdateProfileSkillsResponseDto>> updateProfileSkills(
            @Valid @RequestBody UpdateProfileSkillsRequestDto dto) {
        return ResponseEntity.ok(CommonApiResponse.ok(adminProfileService.updateProfileSkills(dto)));
    }
}

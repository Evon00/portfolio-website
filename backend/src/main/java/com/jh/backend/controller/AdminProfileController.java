package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.profile.request.UpdateProfileRequestDto;
import com.jh.backend.dto.profile.response.UpdateProfileResponseDto;
import com.jh.backend.service.AdminProfileService;
import com.jh.backend.swagger.profile.UpdateProfileSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}

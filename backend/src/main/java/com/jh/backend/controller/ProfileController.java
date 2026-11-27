package com.jh.backend.controller;

import com.jh.backend.common.CommonApiResponse;
import com.jh.backend.dto.profile.response.FindProfileResponseDto;
import com.jh.backend.service.ProfileService;
import com.jh.backend.swagger.profile.FindProfileSwaggerDocs;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "프로필", description = "공개 프로필 API입니다.")
@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // 프로필 조회
    @FindProfileSwaggerDocs
    @GetMapping
    public ResponseEntity<CommonApiResponse<FindProfileResponseDto>> findProfile() {
        return ResponseEntity.ok(CommonApiResponse.ok(profileService.findProfile()));
    }
}

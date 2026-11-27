package com.jh.backend.service.implement;

import com.jh.backend.common.CacheNames;
import com.jh.backend.dto.profile.item.FindProfileItem;
import com.jh.backend.dto.profile.response.FindProfileResponseDto;
import com.jh.backend.entity.Admin;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.AdminRepository;
import com.jh.backend.repository.AdminSkillRepository;
import com.jh.backend.service.ProfileService;
import com.jh.backend.util.file.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AdminRepository adminRepository;
    private final AdminSkillRepository adminSkillRepository;
    private final FileUtil fileUtil;

    // 프로필 조회
    //      -> 결과는 캐시 (Caffeine, profile, TTL 1시간)
    //      -> 프로필 수정, 프로필 이미지 업로드, 핵심 기술 스택 수정, 기술 스택 수정시 커밋 후 캐시 삭제
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheNames.PROFILE, key = "'profile'")
    public FindProfileResponseDto findProfile() {

        // 1. 관리자 조회
        //      -> 관리자는 1명으로 가정 (삭제되지 않은 관리자 중 PK가 가장 작은 관리자)
        //      exc. 관리자 미존재시 에러 처리 (ADMIN_NOT_FOUND)
        Admin admin = adminRepository.findFirstByOrderByIdAsc().orElseThrow(
                () -> new CustomException(ExceptionCode.ADMIN_NOT_FOUND));

        // 2. 핵심 기술 스택 조회
        //      -> 기술 스택을 함께 조회 (JOIN FETCH, N+1 방지)
        //      -> 삭제된 기술 스택 제외
        //      -> priority 오름차순
        List<FindProfileItem> skills = adminSkillRepository.findAllByAdminId(admin.getId()).stream()
                .map(adminSkill -> FindProfileItem.fromEntity(adminSkill, fileUtil.toUrl(adminSkill.getSkill().getS3Key())))
                .toList();

        // 3. 응답 DTO로 변환
        //      -> 프로필 이미지, 기술 스택 아이콘은 s3 key를 공개 주소로 변환 (없으면 null)
        //      -> 핵심 기술 스택이 없으면 빈 목록
        return FindProfileResponseDto.from(admin, fileUtil.toUrl(admin.getProfileS3Key()), skills);
    }
}

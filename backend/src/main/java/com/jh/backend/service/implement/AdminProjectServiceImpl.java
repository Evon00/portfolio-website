package com.jh.backend.service.implement;

import com.jh.backend.dto.project.request.CheckProjectSlugRequestDto;
import com.jh.backend.dto.project.response.CheckProjectSlugResponseDto;
import com.jh.backend.repository.ProjectRepository;
import com.jh.backend.service.AdminProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProjectServiceImpl implements AdminProjectService {

    private final ProjectRepository projectRepository;

    // 프로젝트 슬러그 중복 확인
    //      -> 슬러그 형식(영문 소문자, 숫자, 하이픈, 최대 100자)은 DTO에서 검증 (형식 오류시 400)
    //      -> 중복이어도 에러가 아닌 available = false로 응답
    @Override
    @Transactional(readOnly = true)
    public CheckProjectSlugResponseDto checkProjectSlug(CheckProjectSlugRequestDto dto) {

        // 1. 슬러그 사용 여부 확인
        //      -> 삭제되지 않은 프로젝트 중 같은 슬러그가 있는지 확인
        //      -> 삭제된 프로젝트의 슬러그는 사용 가능으로 판단 (@SQLRestriction, DB 유니크 인덱스도 삭제되지 않은 프로젝트만 대상)
        boolean exists = projectRepository.existsBySlug(dto.projectSlug());

        // 2. 응답 DTO로 변환
        //      -> 같은 슬러그가 없으면 available = true
        return new CheckProjectSlugResponseDto(dto.projectSlug(), !exists);
    }
}

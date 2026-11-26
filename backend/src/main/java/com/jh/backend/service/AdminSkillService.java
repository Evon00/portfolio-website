package com.jh.backend.service;

import com.jh.backend.dto.skill.request.CreateSkillRequestDto;
import com.jh.backend.dto.skill.request.FindAllSkillsRequestDto;
import com.jh.backend.dto.skill.response.CreateSkillResponseDto;
import com.jh.backend.dto.skill.response.FindAllSkillsResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface AdminSkillService {

    // 기술 스택 추가
    CreateSkillResponseDto createSkill(CreateSkillRequestDto dto, MultipartFile file);

    // 기술 스택 목록 조회
    FindAllSkillsResponseDto findAllSkills(FindAllSkillsRequestDto dto);
}

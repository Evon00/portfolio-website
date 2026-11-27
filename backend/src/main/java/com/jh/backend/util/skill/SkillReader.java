package com.jh.backend.util.skill;

import com.jh.backend.dto.skill.item.InvalidSkillIdsItem;
import com.jh.backend.entity.Skill;
import com.jh.backend.exception.CustomException;
import com.jh.backend.exception.ExceptionCode;
import com.jh.backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/*
기술 스택 PK 목록 조회
- 게시글, 프로젝트, 프로필에서 기술 스택을 연결할 때 같은 검증을 사용합니다.
 */
@Component
@RequiredArgsConstructor
public class SkillReader {

    private final SkillRepository skillRepository;

    // 요청 순서대로 기술 스택 조회
    //      exc. 중복 ID가 있으면 에러 처리 (SKILL_ID_DUPLICATED)
    //      exc. 존재하지 않거나 삭제된 ID가 있으면 에러 처리 (SKILL_ID_INVALID, data에 해당 ID 목록)
    public List<Skill> readAllInOrder(List<Long> skillIds) {
        if (new HashSet<>(skillIds).size() != skillIds.size()) {
            throw new CustomException(ExceptionCode.SKILL_ID_DUPLICATED);
        }

        Map<Long, Skill> skillMap = skillRepository.findAllById(skillIds).stream()
                .collect(Collectors.toMap(Skill::getId, Function.identity()));
        List<Long> invalidIds = skillIds.stream().filter(id -> !skillMap.containsKey(id)).toList();
        if (!invalidIds.isEmpty()) {
            throw new CustomException(ExceptionCode.SKILL_ID_INVALID, new InvalidSkillIdsItem(invalidIds));
        }

        return skillIds.stream().map(skillMap::get).toList();
    }
}

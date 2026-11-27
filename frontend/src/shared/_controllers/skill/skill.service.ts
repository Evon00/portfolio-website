import "server-only";

import { skill } from "@/shared/_controllers/data-source.server";

// 기술 스택 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓴다. 실제 구현은 data-source.server.ts가 고른다(skill.api.ts).

/** 전체(최근 등록순). GET /api/admin/skill */
export const findAllSkills = skill.findAllSkills;

/** 추가(multipart: data + file 선택). POST /api/admin/skill */
export const createSkill = skill.createSkill;

/** 수정(multipart PATCH: 보낸 값만 수정, deleteIcon으로 아이콘 삭제). PATCH /api/admin/skill/{skillId} */
export const updateSkill = skill.updateSkill;

/** 삭제. 게시글·프로젝트·프로필에서 쓰는 중이면 409. DELETE /api/admin/skill/{skillId} */
export const deleteSkill = skill.deleteSkill;

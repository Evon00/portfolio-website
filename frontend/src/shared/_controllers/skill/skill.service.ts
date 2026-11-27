import "server-only";

import { skill } from "@/shared/_controllers/data-source.server";

// 기술 스택 데이터 접근 창구. 화면·캐시·액션은 이 함수들만 쓰고 목인지 실제인지 모른다.
// 실제 구현은 data-source.server.ts가 고른다(지금은 _mock/skill.ts, Spring 연결 후 skill.api.ts). 주석의 경로는 예정 엔드포인트다.

/** 전체(최근 등록순). GET /api/admin/skills */
export const getSkills = skill.getSkills;

/** 추가. POST /api/admin/skills */
export const createSkill = skill.createSkill;

/** 수정. PUT /api/admin/skills/{skillId} */
export const updateSkill = skill.updateSkill;

/** 삭제. DELETE /api/admin/skills/{skillId} · 글·프로젝트·프로필에서도 빠진다 */
export const deleteSkill = skill.deleteSkill;

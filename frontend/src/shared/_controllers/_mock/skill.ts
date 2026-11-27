import "server-only";

import { ApiError } from "@/shared/libs/api";
import type { DeleteSkillPath, SkillResponse, SkillSaveRequest, UpdateSkillPath } from "@/shared/_generated";
import { mockDb, mockDelay, nextMockId } from "./store";

// 기술 스택 목 구현(서버 메모리). 인자 · 반환 모양은 skill/skill.api.ts(실제 구현)와 같다(data-source.server.ts의 satisfies가 확인한다).
// data-source.server.ts가 이 파일을 고른다. Spring 연결 때 skill/skill.api.ts로 바꾸면 이 파일은 지운다.

function findSkill(skillId: number) {
  const skill = mockDb.skills.find((item) => item.skillId === skillId);
  if (!skill) throw new ApiError({ status: 404, message: "기술 스택을 찾을 수 없어요." });
  return skill;
}

function assertUniqueName(name: string, exceptId?: number) {
  const key = name.trim().toLowerCase();
  if (mockDb.skills.some((skill) => skill.skillId !== exceptId && skill.name.toLowerCase() === key)) {
    throw new ApiError({ status: 409, message: "이미 있는 기술 스택이에요." });
  }
}

/** 전체(최근 등록순). GET /api/admin/skills */
export async function getSkills(): Promise<SkillResponse[]> {
  await mockDelay();
  return [...mockDb.skills].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.skillId - b.skillId);
}

/** 추가. POST /api/admin/skills */
export async function createSkill(request: SkillSaveRequest): Promise<SkillResponse> {
  await mockDelay();
  assertUniqueName(request.name);
  const skill: SkillResponse = {
    skillId: nextMockId(),
    name: request.name.trim(),
    category: request.category,
    iconUrl: request.iconUrl,
    createdAt: new Date().toISOString(),
  };
  mockDb.skills.push(skill);
  return skill;
}

/** 수정. PUT /api/admin/skills/{skillId} */
export async function updateSkill({ skillId }: UpdateSkillPath, request: SkillSaveRequest): Promise<SkillResponse> {
  await mockDelay();
  assertUniqueName(request.name, skillId);
  const skill = findSkill(skillId);
  Object.assign(skill, { name: request.name.trim(), category: request.category, iconUrl: request.iconUrl });
  return skill;
}

/** 삭제. DELETE /api/admin/skills/{skillId} · 글·프로젝트·프로필에서도 빠진다 */
export async function deleteSkill({ skillId }: DeleteSkillPath) {
  await mockDelay();
  findSkill(skillId);
  mockDb.skills = mockDb.skills.filter((skill) => skill.skillId !== skillId);
  const without = (ids: number[]) => ids.filter((id) => id !== skillId);
  for (const post of mockDb.posts) post.skillIds = without(post.skillIds);
  for (const project of mockDb.projects) project.skillIds = without(project.skillIds);
  mockDb.profile.coreSkillIds = without(mockDb.profile.coreSkillIds);
}

import "server-only";

import type { PostDetailResponse, ProfileResponse, ProjectDetailResponse, SkillResponse } from "@/shared/_controllers/_legacy-types";
import { mockPosts } from "./data/posts";
import { mockProfile } from "./data/profile";
import { mockProjects } from "./data/projects";
import { mockSkills } from "./data/skills";

// 서버 메모리에 두는 목 저장소. 어드민 저장·삭제와 조회수 증가를 흉내 낸다(서버를 다시 켜면 초기화).
// _mock/<도메인>.ts 목 구현만 이 모듈을 쓴다. data-source.server.ts의 모든 줄을 실제 구현으로 바꾸면 이 폴더는 지운다.
// - 기술 스택은 ID로만 연결해 이름·아이콘을 바꾸거나 지우면 글·프로젝트·프로필에 바로 반영된다.
// - 라우트 핸들러·서버 액션·페이지가 같은 데이터를 보도록 globalThis에 하나만 둔다.
type WithSkillIds<T> = Omit<T, "skills"> & { skillIds: number[] };

export type MockPost = WithSkillIds<PostDetailResponse>;
export type MockProject = WithSkillIds<ProjectDetailResponse> & { featured: boolean };
export type MockProfile = Omit<ProfileResponse, "coreSkills"> & { coreSkillIds: number[] };

type MockStore = {
  skills: SkillResponse[];
  profile: MockProfile;
  posts: MockPost[];
  projects: MockProject[];
  lastId: number;
};

const toIds = (skills: SkillResponse[]) => skills.map((skill) => skill.skillId);

function createStore(): MockStore {
  const { coreSkills, ...profile } = structuredClone(mockProfile);
  return {
    skills: structuredClone(Object.values(mockSkills)),
    profile: { ...profile, coreSkillIds: toIds(coreSkills) },
    posts: structuredClone(mockPosts).map(({ skills, ...post }) => ({ ...post, skillIds: toIds(skills) })),
    projects: structuredClone(mockProjects).map(({ skills, ...project }) => ({ ...project, skillIds: toIds(skills) })),
    lastId: 1000,
  };
}

const store = globalThis as typeof globalThis & { __portfolioMockDb?: MockStore };
export const mockDb = (store.__portfolioMockDb ??= createStore());

/** ID 순서대로 기술 스택을 찾는다. 지워진 기술은 빠진다. */
export function resolveSkills(skillIds: number[]): SkillResponse[] {
  return skillIds.flatMap((id) => mockDb.skills.find((skill) => skill.skillId === id) ?? []);
}

/** 새 항목 ID */
export function nextMockId() {
  mockDb.lastId += 1;
  return mockDb.lastId;
}

/** 네트워크 지연 흉내 (캐시가 채워지는 첫 요청에서만 체감된다) */
export function mockDelay(ms = 80) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

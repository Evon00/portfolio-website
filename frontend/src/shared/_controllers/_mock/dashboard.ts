import "server-only";

import type { DashboardResponse, DashboardSkillShare } from "@/shared/_generated";
import { mockDb, mockDelay, resolveSkills } from "./store";

// 대시보드 목 구현(서버 메모리). 인자 · 반환 모양은 dashboard/dashboard.api.ts(실제 구현)와 같다(data-source.server.ts의 satisfies가 확인한다).
// data-source.server.ts가 이 파일을 고른다. Spring 연결 때 dashboard/dashboard.api.ts로 바꾸면 이 파일은 지운다.

function countSkills(groups: number[][]): DashboardSkillShare[] {
  const counts = new Map<number, number>();
  for (const id of groups.flat()) counts.set(id, (counts.get(id) ?? 0) + 1);
  return resolveSkills([...counts.keys()])
    .map((skill) => ({ name: skill.name, count: counts.get(skill.skillId) ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

/** 대시보드 요약. GET /api/admin/dashboard */
export async function getDashboard(): Promise<DashboardResponse> {
  await mockDelay();
  const { posts, projects } = mockDb;
  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);
  return {
    totalPosts: posts.length,
    totalProjects: projects.length,
    totalViews,
    avgViews: posts.length ? Math.round(totalViews / posts.length) : 0,
    popularPosts: [...posts]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(({ postId, title, viewCount }) => ({ postId, title, viewCount })),
    postSkills: countSkills(posts.map((post) => post.skillIds)),
    projectSkills: countSkills(projects.map((project) => project.skillIds)),
  };
}
